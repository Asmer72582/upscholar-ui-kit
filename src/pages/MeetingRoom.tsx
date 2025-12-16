import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { toast } from 'sonner';
import { SOCKET_URL } from '@/config/env';
import { getMediaStream, checkWebRTCSupport, requestMediaPermissions } from '@/utils/webrtc';
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
  Phone,
  PhoneOff,
  Send,
  Palette,
  Eraser,
  Trash2,
  Settings,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  socketId: string;
  name: string;
  email: string;
  video: boolean;
  audio: boolean;
  isHost: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

interface PeerConnection {
  peer: Peer.Instance;
  stream?: MediaStream;
}

const RemoteVideo: React.FC<{ stream?: MediaStream; participant?: Participant }> = ({ stream, participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-auto rounded"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
        {participant?.name || 'Unknown'}
      </div>
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

  // UI state
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Whiteboard
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(2);
  const [whiteboardData, setWhiteboardData] = useState<any[]>([]);

  // Get user media with enhanced error handling
  const getUserMedia = async () => {
    try {
      console.log('🔍 Checking WebRTC support...');
      const support = checkWebRTCSupport();
      
      if (!support.hasWebRTC) {
        throw new Error('WebRTC not supported in this browser');
      }
      
      if (!support.isSecureContext) {
        throw new Error('WebRTC requires HTTPS. Please use a secure connection.');
      }

      console.log('🔐 Requesting media permissions...');
      
      // Try to get media with video first
      let stream: MediaStream;
      
      try {
        console.log('🎥 Attempting to get video + audio stream...');
        stream = await getMediaStream({ video: true, audio: true });
        console.log('✅ Got video + audio stream');
        setVideoEnabled(true);
      } catch (videoError) {
        console.warn('⚠️ Video failed, trying audio only:', videoError);
        
        try {
          stream = await getMediaStream({ video: false, audio: true });
          console.log('✅ Got audio-only stream');
          setVideoEnabled(false);
          toast.info('Joined with audio only (camera not available)');
        } catch (audioError) {
          console.error('❌ Audio also failed:', audioError);
          throw new Error('Could not access camera or microphone. Please check permissions and device.');
        }
      }

      // Set up local video
      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(err => {
          console.error('Error playing local video:', err);
        });
      }

      setLocalStream(stream);
      return stream;
      
    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      
      if (error instanceof Error) {
        setConnectionError(error.message);
        toast.error(error.message);
      } else {
        setConnectionError('Failed to access camera/microphone');
        toast.error('Failed to access camera/microphone');
      }
      
      throw error;
    }
  };

  // Initialize meeting with enhanced error handling
  const initializeMeeting = async () => {
    try {
      console.log('🚀 Initializing meeting...');
      setIsConnecting(true);
      setConnectionError(null);

      // Get user media first
      const stream = await getUserMedia();
      
      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      // Connect to socket
      console.log('🔗 Connecting to socket server...');
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setSocket(newSocket);
        setIsConnecting(false);
        
        // Join meeting
        newSocket.emit('join-meeting', {
          meetingId: lectureId,
          user: {
            name: user?.name || 'Anonymous',
            email: user?.email || 'anonymous@example.com',
          }
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setConnectionError('Failed to connect to meeting server');
        setIsConnecting(false);
        toast.error('Failed to connect to meeting server');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server forced disconnect, try to reconnect
          newSocket.connect();
        }
      });

      // Meeting events
      newSocket.on('meeting-joined', (data) => {
        console.log('✅ Joined meeting:', data);
        setIsHost(data.isHost);
        setMeetingStarted(data.meetingStarted);
        setParticipants(data.participants || []);
      });

      newSocket.on('user-joined', (participant) => {
        console.log('👤 User joined:', participant);
        setParticipants(prev => [...prev, participant]);
        toast.success(`${participant.name} joined the meeting`);
      });

      newSocket.on('user-left', (socketId) => {
        console.log('👤 User left:', socketId);
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        
        // Clean up peer connection
        const peerConnection = peersRef.current.get(socketId);
        if (peerConnection) {
          peerConnection.peer.destroy();
          peersRef.current.delete(socketId);
          setPeers(new Map(peersRef.current));
        }
      });

      // WebRTC signaling
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
        console.log('📨 Received ICE candidate from:', from);
        const peerConnection = peersRef.current.get(from);
        if (peerConnection) {
          peerConnection.peer.signal(candidate);
        }
      });

      // Media toggles
      newSocket.on('user-video-toggle', ({ socketId, enabled }) => {
        setParticipants(prev => prev.map(p => 
          p.socketId === socketId ? { ...p, video: enabled } : p
        ));
      });

      newSocket.on('user-audio-toggle', ({ socketId, enabled }) => {
        setParticipants(prev => prev.map(p => 
          p.socketId === socketId ? { ...p, audio: enabled } : p
        ));
      });

      // Chat
      newSocket.on('new-message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      });

      // Meeting ended
      newSocket.on('meeting-ended', () => {
        toast.info('Meeting has been ended by the host');
        cleanup();
        navigate('/');
      });

    } catch (error) {
      console.error('❌ Error initializing meeting:', error);
      setIsConnecting(false);
      
      if (error instanceof Error) {
        setConnectionError(error.message);
        toast.error(error.message);
      } else {
        setConnectionError('Failed to initialize meeting');
        toast.error('Failed to initialize meeting');
      }
    }
  };

  // Create peer connection
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
      console.log('Peer already exists for:', socketId);
      return;
    }

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
      console.log(`📤 Sending ${initiator ? 'offer' : 'answer'} to:`, socketId);
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
    
    peer.on('track', (track, stream) => {
      console.log('🎬 New track received from:', socketId, 'Kind:', track.kind, 'Label:', track.label);
    });

    peer.on('error', (err) => {
      console.error('❌ Peer connection error with', socketId, ':', err);
    });

    peer.on('close', () => {
      console.log('🔴 Peer connection closed:', socketId);
    });

    peer.on('connect', () => {
      console.log('🟢 Peer connected:', socketId);
    });

    if (offer) {
      console.log('📨 Signaling with offer from:', socketId);
      peer.signal(offer);
    }

    const peerConnection: PeerConnection = { peer };
    peersRef.current.set(socketId, peerConnection);
    setPeers(new Map(peersRef.current));
    
    console.log('✅ Peer connection created and stored for:', socketId);
  };

  // Media controls
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        socket?.emit('toggle-video', { meetingId: lectureId, enabled: videoTrack.enabled });
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        socket?.emit('toggle-audio', { meetingId: lectureId, enabled: audioTrack.enabled });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
        setScreenSharing(false);
        socket?.emit('stop-screen-share', { meetingId: lectureId });
        
        // Replace screen track with camera track in all peer connections
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                peer.streams[0].getVideoTracks()[0],
                videoTrack,
                peer.streams[0]
              );
            });
          }
        }
      }
    } else {
      // Start screen sharing
      try {
        const screenMediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setScreenStream(screenMediaStream);
        setScreenSharing(true);
        socket?.emit('start-screen-share', { meetingId: lectureId });
        
        // Replace camera track with screen track in all peer connections
        if (localStream && screenMediaStream) {
          const screenVideoTrack = screenMediaStream.getVideoTracks()[0];
          if (screenVideoTrack) {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                localStream!.getVideoTracks()[0],
                screenVideoTrack,
                localStream!
              );
            });
          }
        }
        
        // Handle screen share end
        screenMediaStream.getVideoTracks()[0].addEventListener('ended', () => {
          toggleScreenShare();
        });
        
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast.error('Failed to share screen');
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: user?.name || 'Anonymous',
        message: newMessage.trim(),
        timestamp: new Date(),
        isOwn: true
      };
      
      socket.emit('send-message', {
        meetingId: lectureId,
        message: message.message
      });
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const endMeeting = () => {
    if (socket) {
      socket.emit('end-meeting', { meetingId: lectureId });
    }
    cleanup();
    navigate('/');
  };

  const leaveMeeting = () => {
    cleanup();
    navigate('/');
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up...');
    
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    // Destroy all peer connections
    peersRef.current.forEach(({ peer }) => {
      peer.destroy();
    });
    peersRef.current.clear();
    setPeers(new Map());
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  // Initialize meeting on mount
  useEffect(() => {
    initializeMeeting();
    
    return () => {
      cleanup();
    };
  }, [lectureId]);

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(err => {
        console.error('Error playing local video:', err);
      });
    }
  }, [localStream]);

  // Set up screen video
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      screenVideoRef.current.play().catch(err => {
        console.error('Error playing screen video:', err);
      });
    }
  }, [screenStream]);

  // Connection status display
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-white text-xl mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-4">{connectionError}</p>
          <Button onClick={initializeMeeting} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Meeting Room</h1>
          <div className="text-sm text-gray-300">
            Participants: {participants.length + 1}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleVideo}
            variant={videoEnabled ? 'default' : 'destructive'}
            size="sm"
          >
            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={toggleAudio}
            variant={audioEnabled ? 'default' : 'destructive'}
            size="sm"
          >
            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={toggleScreenShare}
            variant={screenSharing ? 'default' : 'outline'}
            size="sm"
          >
            {screenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={leaveMeeting}
            variant="destructive"
            size="sm"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
          
          {isHost && (
            <Button
              onClick={endMeeting}
              variant="destructive"
              size="sm"
            >
              End Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          {screenSharing ? (
            // Screen sharing layout
            <div className="h-full">
              {/* Screen share video */}
              <div className="mb-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-auto rounded"
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Remote videos - small */}
              <div className="flex space-x-2 overflow-x-auto">
                {/* Local video - small */}
                <Card className="bg-gray-800 border-gray-700 flex-shrink-0 w-48">
                  <CardContent className="p-2 relative h-full">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-auto rounded"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
                      You {isHost && '(Host)'}
                    </div>
                    {!videoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded">
                        <VideoOff className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Remote Videos - Small */}
                {Array.from(peers.entries()).map(([socketId, { stream }]) => {
                  const participant = participants.find(p => p.socketId === socketId);
                  return (
                    <Card key={socketId} className="bg-gray-800 border-gray-700 flex-shrink-0 w-48">
                      <CardContent className="p-2 relative h-full">
                        <RemoteVideo stream={stream} participant={participant} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            // Normal Grid Layout - No screen sharing
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Local Video */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-2 relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-auto rounded"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                  You {isHost && '(Host)'}
                </div>
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Remote Videos */}
            {Array.from(peers.entries()).map(([socketId, { stream }]) => {
              const participant = participants.find(p => p.socketId === socketId);
              return (
                <Card key={socketId} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-2 relative">
                    <RemoteVideo stream={stream} participant={participant} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <Tabs defaultValue="chat" className="h-full">
            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1">
                <MessageSquare className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="participants" className="flex-1">
                <Users className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="h-full p-0">
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'p-2 rounded',
                        message.isOwn ? 'bg-blue-600 ml-8' : 'bg-gray-700 mr-8'
                      )}
                    >
                      <div className="text-xs text-gray-300 mb-1">
                        {message.sender}
                      </div>
                      <div className="text-sm">{message.message}</div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="participants" className="h-full p-4">
              <div className="space-y-2">
                <div className="p-2 bg-gray-700 rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user?.name || 'You'}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {isHost && '(Host)'}
                  </div>
                </div>
                
                {participants.map((participant) => (
                  <div key={participant.socketId} className="p-2 bg-gray-700 rounded">
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-xs text-gray-400">{participant.email}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs ${participant.video ? 'text-green-400' : 'text-red-400'}`}>
                        {participant.video ? 'Video On' : 'Video Off'}
                      </span>
                      <span className={`text-xs ${participant.audio ? 'text-green-400' : 'text-red-400'}`}>
                        {participant.audio ? 'Audio On' : 'Audio Off'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};