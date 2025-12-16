import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { toast } from 'sonner';
import { SOCKET_URL } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Palette,
  PhoneOff,
  Send,
  Eraser,
  Undo,
  Download,
  Trash2
} from 'lucide-react';

interface Participant {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  video: boolean;
  audio: boolean;
  screen: boolean;
}

interface ChatMessage {
  id: number;
  userName: string;
  message: string;
  timestamp: string;
}

interface PeerConnection {
  peer: Peer.Instance;
  stream?: MediaStream;
}

// Remote Video Component with proper stream handling
const RemoteVideo: React.FC<{ stream?: MediaStream; participant?: Participant }> = ({ stream, participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Ensure video plays
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  }, [stream]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-auto rounded"
      />
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
        {participant?.userName || 'Unknown'}
      </div>
      {!participant?.video && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded">
          <VideoOff className="w-12 h-12 text-gray-400" />
        </div>
      )}
      {!participant?.audio && (
        <div className="absolute top-2 right-2 bg-red-600 p-1 rounded">
          <MicOff className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export const MeetingRoom: React.FC = () => {
  console.log('MeetingRoom component loaded'); // Force inclusion in build
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Socket and WebRTC
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  // Media streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Meeting state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Whiteboard
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#000000');
  const [drawWidth, setDrawWidth] = useState(2);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // UI
  const [activeTab, setActiveTab] = useState('participants');

  useEffect(() => {
    if (!user || !lectureId) {
      navigate('/login');
      return;
    }

    initializeMeeting();

    return () => {
      console.log('🧹 Cleaning up meeting room');
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.disconnect();
      }
      peersRef.current.forEach(({ peer }) => {
        try {
          peer.destroy();
        } catch (error) {
          console.error('Error destroying peer:', error);
        }
      });
    };
  }, [user, lectureId]);

  const initializeMeeting = async () => {
    try {
      console.log('🔧 Initializing meeting...');
      console.log('📍 Current URL:', window.location.href);
      console.log('🔒 Protocol:', window.location.protocol);
      
      // Check HTTPS requirement
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.error('❌ WebRTC requires HTTPS in production!');
        toast.error('Meeting requires HTTPS connection. Please use https:// instead of http://');
        return;
      }

      // Get user media - try with video, fallback to audio only
      let stream: MediaStream | null = null;
      
      try {
        console.log('📹 Requesting camera and microphone access...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        console.log('✅ Got local stream with video:', stream.id);
        console.log('📹 Video tracks:', stream.getVideoTracks().length);
        console.log('🎤 Audio tracks:', stream.getAudioTracks().length);
      } catch (videoError: any) {
        console.warn('⚠️ Video not available, trying audio only:', videoError.name, videoError.message);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          console.log('✅ Got local stream with audio only:', stream.id);
          setVideoEnabled(false);
          toast.info('Joined with audio only (camera not available)');
        } catch (audioError: any) {
          console.error('❌ No media available:', audioError.name, audioError.message);
          toast.error('Could not access camera or microphone. Please check permissions.');
          return;
        }
      }
      
      if (!stream) {
        toast.error('Failed to get media stream');
        return;
      }
      
      setLocalStream(stream);
      if (localVideoRef.current && stream.getVideoTracks().length > 0) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Mute local video to prevent feedback
      }

      // Connect to socket
      console.log('🔗 Connecting to Socket.io server:', SOCKET_URL);
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        toast.success('Connected to meeting server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        toast.error('Failed to connect to meeting server');
      });

      newSocket.emit('join-meeting', {
        meetingId: lectureId,
        userId: (user as any).id || (user as any)._id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role
      });

      newSocket.on('meeting-joined', ({ participants: existingParticipants, whiteboard, chat, isHost: host }) => {
        console.log('✅ Meeting joined! Existing participants:', existingParticipants.length);
        setParticipants(existingParticipants);
        setIsHost(host);
        setMessages(chat);
        
        // Connect to existing participants
        existingParticipants.forEach((participant: Participant) => {
          console.log('🔄 Creating peer connection to:', participant.userName);
          createPeer(participant.socketId, newSocket, stream, true);
        });

        // Restore whiteboard
        if (whiteboard && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            whiteboard.forEach((data: any) => {
              drawOnCanvas(ctx, data);
            });
          }
        }

        toast.success('Joined meeting successfully!');
      });

      newSocket.on('user-joined', ({ socketId, userId, userName, userRole }) => {
        console.log('👋 New user joined:', userName, 'socketId:', socketId);
        setParticipants(prev => [...prev, { socketId, userId, userName, userRole, video: true, audio: true, screen: false }]);
        
        // Small delay to ensure socket is ready
        setTimeout(() => {
          console.log('🔄 Creating peer for new user:', userName);
          createPeer(socketId, newSocket, stream, true);
        }, 500);
        
        toast.info(`${userName} joined the meeting`);
      });

      newSocket.on('user-left', ({ socketId }) => {
        console.log('👋 User left:', socketId);
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        const peerConnection = peersRef.current.get(socketId);
        if (peerConnection) {
          peerConnection.peer.destroy();
          peersRef.current.delete(socketId);
          setPeers(new Map(peersRef.current));
        }
      });

      newSocket.on('offer', ({ from, offer }) => {
        console.log('📨 Received offer from:', from);
        createPeer(from, newSocket, stream, false, offer);
      });

      newSocket.on('answer', ({ from, answer }) => {
        console.log('📨 Received answer from:', from);
        const peerConnection = peersRef.current.get(from);
        if (peerConnection) {
          peerConnection.peer.signal(answer);
        }
      });

      newSocket.on('ice-candidate', ({ from, candidate }) => {
        console.log('🧊 Received ICE candidate from:', from);
        const peerConnection = peersRef.current.get(from);
        if (peerConnection) {
          peerConnection.peer.signal(candidate);
        }
      });

      newSocket.on('whiteboard-update', (data) => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            drawOnCanvas(ctx, data);
          }
        }
      });

      newSocket.on('chat-message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('participant-updated', ({ socketId, video, audio, screen }) => {
        setParticipants(prev => prev.map(p => 
          p.socketId === socketId ? { ...p, video, audio, screen } : p
        ));
      });

    } catch (error: any) {
      console.error('❌ Meeting initialization error:', error);
      toast.error(`Failed to initialize meeting: ${error.message}`);
    }
  };

  const createPeer = (
    socketId: string,
    socket: Socket,
    stream: MediaStream,
    initiator: boolean,
    offer?: any
  ) => {
    console.log(`🔧 Creating peer connection - socketId: ${socketId}, initiator: ${initiator}`);
    
    // Check if peer already exists
    if (peersRef.current.has(socketId)) {
      console.log('⚠️ Peer already exists for:', socketId);
      return;
    }

    try {
      const peer = new Peer({
        initiator,
        trickle: true,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });

      peer.on('signal', (signal) => {
        console.log(`📡 Sending ${initiator ? 'offer' : 'answer'} to:`, socketId);
        if (initiator) {
          socket.emit('offer', { to: socketId, offer: signal });
        } else {
          socket.emit('answer', { to: socketId, answer: signal });
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('✅ Received remote stream from:', socketId, 'Tracks:', remoteStream.getTracks().length);
        remoteStream.getTracks().forEach(track => {
          console.log('  - Track:', track.kind, 'ID:', track.id, 'enabled:', track.enabled, 'label:', track.label);
        });
        
        const peerConnection = peersRef.current.get(socketId);
        if (peerConnection) {
          peerConnection.stream = remoteStream;
          setPeers(new Map(peersRef.current));
          console.log('📺 Stream stored for peer:', socketId);
        }
      });

      peer.on('error', (error) => {
        console.error('❌ Peer connection error for', socketId, ':', error);
        // Don't show toast for every peer error, just log it
      });

      peer.on('close', () => {
        console.log('🔒 Peer connection closed for:', socketId);
        const peerConnection = peersRef.current.get(socketId);
        if (peerConnection) {
          peersRef.current.delete(socketId);
          setPeers(new Map(peersRef.current));
        }
      });

      // Handle incoming offer
      if (offer) {
        console.log('📨 Processing incoming offer for:', socketId);
        peer.signal(offer);
      }

      // Store peer connection
      peersRef.current.set(socketId, { peer });
      setPeers(new Map(peersRef.current));
      
      console.log('✅ Peer connection created successfully for:', socketId);

    } catch (error: any) {
      console.error('❌ Failed to create peer connection for', socketId, ':', error.message);
      toast.error(`Failed to connect to participant: ${error.message}`);
    }
  };

  const toggleVideo = async () => {
    if (!localStream) return;
    
    try {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
        
        if (socket) {
          socket.emit('update-participant', { video: !videoEnabled, audio: audioEnabled });
        }
        
        toast.info(videoEnabled ? 'Camera turned off' : 'Camera turned on');
      } else {
        toast.error('No video track available');
      }
    } catch (error: any) {
      console.error('❌ Error toggling video:', error);
      toast.error(`Failed to toggle video: ${error.message}`);
    }
  };

  const toggleAudio = async () => {
    if (!localStream) return;
    
    try {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
        
        if (socket) {
          socket.emit('update-participant', { video: videoEnabled, audio: !audioEnabled });
        }
        
        toast.info(audioEnabled ? 'Microphone muted' : 'Microphone unmuted');
      } else {
        toast.error('No audio track available');
      }
    } catch (error: any) {
      console.error('❌ Error toggling audio:', error);
      toast.error(`Failed to toggle audio: ${error.message}`);
    }
  };

  const toggleScreenShare = async () => {
    if (!localStream) return;
    
    try {
      if (!screenSharing) {
        // Start screen share
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setScreenStream(stream);
        setScreenSharing(true);
        
        // Replace video track in local stream
        const videoTrack = stream.getVideoTracks()[0];
        const sender = localStream.getVideoTracks()[0];
        if (sender) {
          localStream.removeTrack(sender);
          localStream.addTrack(videoTrack);
        }
        
        // Update all peer connections
        peersRef.current.forEach(({ peer }) => {
          if (peer && videoTrack) {
            peer.replaceTrack(sender, videoTrack, localStream);
          }
        });
        
        if (socket) {
          socket.emit('update-participant', { video: videoEnabled, audio: audioEnabled, screen: true });
        }
        
        toast.success('Screen sharing started');
        
        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare();
        };
        
      } else {
        stopScreenShare();
      }
    } catch (error: any) {
      console.error('❌ Error toggling screen share:', error);
      toast.error(`Failed to share screen: ${error.message}`);
    }
  };

  const stopScreenShare = () => {
    if (!localStream || !screenStream) return;
    
    try {
      // Stop screen stream
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setScreenSharing(false);
      
      // Get back camera stream
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      }).then(cameraStream => {
        const cameraTrack = cameraStream.getVideoTracks()[0];
        const screenTrack = localStream.getVideoTracks()[0];
        
        if (screenTrack && cameraTrack) {
          localStream.removeTrack(screenTrack);
          localStream.addTrack(cameraTrack);
          
          // Update all peer connections
          peersRef.current.forEach(({ peer }) => {
            if (peer && cameraTrack) {
              peer.replaceTrack(screenTrack, cameraTrack, localStream);
            }
          });
        }
        
        cameraStream.getTracks().forEach(track => track.stop());
        
        if (socket) {
          socket.emit('update-participant', { video: videoEnabled, audio: audioEnabled, screen: false });
        }
        
        toast.success('Screen sharing stopped');
      }).catch(error => {
        console.error('❌ Error getting camera stream back:', error);
      });
    } catch (error: any) {
      console.error('❌ Error stopping screen share:', error);
      toast.error(`Failed to stop screen share: ${error.message}`);
    }
  };

  const leaveMeeting = () => {
    if (confirm('Are you sure you want to leave the meeting?')) {
      navigate('/dashboard');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    
    const message: ChatMessage = {
      id: Date.now(),
      userName: `${user.firstName} ${user.lastName}`,
      message: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };
    
    socket.emit('chat-message', message);
    setNewMessage('');
  };

  // Whiteboard functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = drawWidth * 5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = drawWidth;
      }
      
      ctx.lineTo(x, y);
      ctx.stroke();
      
      if (socket) {
        socket.emit('whiteboard-update', {
          type: tool,
          x,
          y,
          color: drawColor,
          width: drawWidth,
          tool
        });
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const drawOnCanvas = (ctx: CanvasRenderingContext2D, data: any) => {
    if (data.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = data.width * 5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.width;
    }
    
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit('whiteboard-clear');
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `whiteboard-${lectureId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Meeting Room</h1>
          <p className="text-sm text-gray-400">Lecture ID: {lectureId}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={leaveMeeting}
            className="flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            Leave
          </Button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Main Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Local Video */}
            <div className="relative">
              <Card className="h-full bg-gray-800">
                <CardContent className="p-4 h-full">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                    You ({user.firstName} {user.lastName})
                  </div>
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded">
                      <VideoOff className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Remote Videos */}
            {Array.from(peers.entries()).map(([socketId, { stream }]) => {
              const participant = participants.find(p => p.socketId === socketId);
              return (
                <div key={socketId} className="relative">
                  <Card className="h-full bg-gray-800">
                    <CardContent className="p-4 h-full">
                      <RemoteVideo stream={stream} participant={participant} />
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 p-4 flex flex-col">
          {/* Controls */}
          <div className="mb-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="sm"
                onClick={toggleVideo}
                className="flex-1"
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="sm"
                onClick={toggleAudio}
                className="flex-1"
              >
                {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={screenSharing ? "default" : "outline"}
                size="sm"
                onClick={toggleScreenShare}
                className="flex-1"
              >
                {screenSharing ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="participants">
                <Users className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="whiteboard">
                <Palette className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="participants" className="mt-0 h-full">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">You ({user.firstName} {user.lastName})</span>
                  </div>
                  {participants.map((participant) => (
                    <div key={participant.socketId} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{participant.userName}</span>
                      {!participant.video && <VideoOff className="w-3 h-3 text-gray-400" />}
                      {!participant.audio && <MicOff className="w-3 h-3 text-gray-400" />}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-0 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                  {messages.map((message) => (
                    <div key={message.id} className="p-2 bg-gray-700 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{message.userName}</span>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-gray-700 border-gray-600 text-white"
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="whiteboard" className="mt-0 h-full flex flex-col">
                <div className="flex gap-2 mb-4 flex-wrap">
                  <input
                    type="color"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                    className="w-8 h-8 rounded border-none"
                  />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={drawWidth}
                    onChange={(e) => setDrawWidth(parseInt(e.target.value))}
                    className="w-20"
                  />
                  <Button
                    variant={tool === 'pen' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTool('pen')}
                  >
                    Pen
                  </Button>
                  <Button
                    variant={tool === 'eraser' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTool('eraser')}
                  >
                    <Eraser className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCanvas}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={400}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border border-gray-600 rounded bg-white cursor-crosshair"
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};