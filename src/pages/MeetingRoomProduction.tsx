import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ScreenShare, 
  StopCircle,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  Copy,
  Check
} from 'lucide-react';
import { createSafePeer, SafePeerInstance } from '@/utils/safe-peer';
import { getWebRTCConfig, isSecureContext, checkWebRTCSupport } from '@/utils/webrtc-config';
import type Peer from 'vite-compatible-simple-peer';

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
  peer: SafePeerInstance;
  stream?: MediaStream;
}

export const MeetingRoomProduction: React.FC = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // UI state
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Initialize meeting
  const initializeMeeting = useCallback(async () => {
    try {
      console.log('🚀 Initializing production meeting room...');
      
      // Check WebRTC support
      const support = checkWebRTCSupport();
      if (!support.supported) {
        throw new Error(`WebRTC not supported: ${support.error}`);
      }

      // Check secure context
      if (!isSecureContext()) {
        throw new Error('WebRTC requires HTTPS or localhost for production');
      }

      setIsConnecting(true);
      setConnectionError(null);

      // Get user media
      const stream = await getUserMedia();
      setLocalStream(stream);

      // Connect to signaling server
      await connectToSignalingServer(stream);

      // Set meeting URL
      const url = `${window.location.origin}/meeting/${lectureId}`;
      setMeetingUrl(url);

      toast({
        title: 'Connected',
        description: 'Successfully joined the meeting',
        variant: 'default'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize meeting';
      console.error('❌ Meeting initialization failed:', errorMessage);
      setConnectionError(errorMessage);
      
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  }, [lectureId, toast]);

  // Get user media with proper error handling
  const getUserMedia = async (): Promise<MediaStream> => {
    try {
      console.log('📹 Requesting camera and microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
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

      console.log('✅ Got local stream:', stream.id);
      return stream;

    } catch (videoError) {
      console.warn('⚠️ Video not available, trying audio only:', videoError);
      
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        console.log('✅ Got audio-only stream');
        return audioStream;
        
      } catch (audioError) {
        throw new Error('Camera and microphone access denied. Please allow access to join the meeting.');
      }
    }
  };

  // Connect to Socket.IO signaling server
  const connectToSignalingServer = async (stream: MediaStream): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://13.60.254.183:3000';
        console.log('🔗 Connecting to signaling server:', API_URL);

        const socketInstance = io(API_URL, {
          transports: ['websocket', 'polling'],
          secure: API_URL.startsWith('https://'),
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000
        });

        socketInstance.on('connect', () => {
          console.log('✅ Connected to signaling server');
          setSocket(socketInstance);
          
          // Join meeting room
          socketInstance.emit('join-meeting', {
            lectureId,
            userId: user?.id,
            userName: user?.name || 'Anonymous',
            userRole: user?.role || 'student'
          });
          
          resolve();
        });

        socketInstance.on('connect_error', (error) => {
          console.error('❌ Signaling server connection error:', error);
          reject(new Error('Failed to connect to meeting server'));
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('🔌 Disconnected from signaling server:', reason);
          if (reason === 'io server disconnect') {
            // Server forcefully disconnected, try to reconnect
            socketInstance.connect();
          }
        });

        // Handle meeting events
        setupSocketListeners(socketInstance, stream);

      } catch (error) {
        reject(error);
      }
    });
  };

  // Setup Socket.IO event listeners
  const setupSocketListeners = (socketInstance: Socket, stream: MediaStream): void => {
    socketInstance.on('meeting-joined', ({ isHost: hostStatus, participants: existingParticipants }) => {
      console.log('✅ Joined meeting as host:', hostStatus);
      setIsHost(hostStatus);
      setParticipants(existingParticipants);
    });

    socketInstance.on('user-joined', ({ socketId, userId, userName, userRole }) => {
      console.log('👤 User joined:', userName);
      setParticipants(prev => [...prev, { socketId, userId, userName, userRole, video: true, audio: true, screen: false }]);
      
      // Create peer connection for new user
      setTimeout(() => {
        createPeer(socketId, socketInstance, stream, true);
      }, 500);
      
      toast({
        title: 'User Joined',
        description: `${userName} joined the meeting`,
        variant: 'default'
      });
    });

    socketInstance.on('user-left', ({ socketId }) => {
      console.log('👋 User left:', socketId);
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
      
      const peerConnection = peersRef.current.get(socketId);
      if (peerConnection) {
        peerConnection.peer.destroy();
        peersRef.current.delete(socketId);
        setPeers(new Map(peersRef.current));
      }
    });

    socketInstance.on('offer', ({ from, offer }) => {
      console.log('📨 Received offer from:', from);
      createPeer(from, socketInstance, stream, false, offer);
    });

    socketInstance.on('answer', ({ from, answer }) => {
      console.log('📨 Received answer from:', from);
      const peerConnection = peersRef.current.get(from);
      if (peerConnection) {
        peerConnection.peer.signal(answer);
      }
    });

    socketInstance.on('ice-candidate', ({ from, candidate }) => {
      console.log('🧊 Received ICE candidate from:', from);
      const peerConnection = peersRef.current.get(from);
      if (peerConnection) {
        peerConnection.peer.signal(candidate);
      }
    });

    socketInstance.on('chat-message', ({ userName, message, timestamp }) => {
      setMessages(prev => [...prev, { id: Date.now(), userName, message, timestamp }]);
    });

    socketInstance.on('screen-share-started', ({ userId: sharingUserId }) => {
      setParticipants(prev => prev.map(p => ({ ...p, screen: p.userId === sharingUserId })));
    });

    socketInstance.on('screen-share-stopped', ({ userId: sharingUserId }) => {
      setParticipants(prev => prev.map(p => ({ ...p, screen: p.userId === sharingUserId ? false : p.screen })));
    });
  };

  // Create peer connection using browser-safe simple-peer
  const createPeer = (
    socketId: string,
    socketInstance: Socket,
    stream: MediaStream,
    initiator: boolean,
    offer?: Peer.SignalData
  ): void => {
    try {
      console.log(`🔧 Creating peer connection - socketId: ${socketId}, initiator: ${initiator}`);
      
      if (peersRef.current.has(socketId)) {
        console.log('⚠️ Peer already exists for:', socketId);
        return;
      }

      const peer = createSafePeer({
        initiator,
        stream,
        trickle: true,
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
          socketInstance.emit('offer', { to: socketId, offer: signal });
        } else {
          socketInstance.emit('answer', { to: socketId, answer: signal });
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('✅ Received remote stream from:', socketId);
        
        const peerConnection = { peer, stream: remoteStream };
        peersRef.current.set(socketId, peerConnection);
        setPeers(new Map(peersRef.current));
      });

      peer.on('error', (error) => {
        console.error('❌ Peer connection error for', socketId, ':', error);
      });

      peer.on('close', () => {
        console.log('🔒 Peer connection closed for:', socketId);
        peersRef.current.delete(socketId);
        setPeers(new Map(peersRef.current));
      });

      if (offer) {
        peer.signal(offer);
      }

      peersRef.current.set(socketId, { peer });
      setPeers(new Map(peersRef.current));

    } catch (error) {
      console.error('❌ Failed to create peer connection for', socketId, ':', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to participant',
        variant: 'destructive'
      });
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        
        if (socket) {
          socket.emit('video-toggle', { enabled: videoTrack.enabled });
        }
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        
        if (socket) {
          socket.emit('audio-toggle', { enabled: audioTrack.enabled });
        }
      }
    }
  };

  // Copy meeting URL
  const copyMeetingUrl = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'Copied!',
        description: 'Meeting URL copied to clipboard',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy meeting URL',
        variant: 'destructive'
      });
    }
  };

  // Leave meeting
  const leaveMeeting = () => {
    console.log('👋 Leaving meeting...');
    
    // Clean up media streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
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
    }

    navigate('/dashboard');
  };

  // Send chat message
  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('chat-message', { message: newMessage });
      setNewMessage('');
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize meeting on mount
  useEffect(() => {
    initializeMeeting();

    return () => {
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

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
        <div className="text-center max-w-md">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-4">
            <h3 className="text-red-400 font-semibold mb-2">Connection Failed</h3>
            <p className="text-gray-300">{connectionError}</p>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Meeting Room</h1>
            {isHost && <Badge variant="secondary">Host</Badge>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyMeetingUrl}
              className="border-gray-600"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="border-gray-600"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <Users className="h-4 w-4" />
              {participants.length + 1}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={leaveMeeting}
            >
              <PhoneOff className="h-4 w-4" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main video area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded">
                <span className="text-sm">You</span>
              </div>
              <div className="absolute bottom-4 right-4 flex space-x-2">
                {!videoEnabled && (
                  <div className="bg-red-500/80 p-1 rounded">
                    <VideoOff className="h-4 w-4" />
                  </div>
                )}
                {!audioEnabled && (
                  <div className="bg-red-500/80 p-1 rounded">
                    <MicOff className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Remote videos */}
            {Array.from(peers.entries()).map(([socketId, { stream }]) => {
              const participant = participants.find(p => p.socketId === socketId);
              if (!participant || !stream) return null;

              return (
                <div key={socketId} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    autoPlay
                    playsInline
                    ref={(video) => {
                      if (video && stream) {
                        video.srcObject = stream;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded">
                    <span className="text-sm">{participant.userName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{message.userName}</span>
                    <span className="text-xs text-gray-400">{message.timestamp}</span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <Button onClick={sendMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={videoEnabled ? "outline" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="border-gray-600"
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            {videoEnabled ? 'Stop Video' : 'Start Video'}
          </Button>
          
          <Button
            variant={audioEnabled ? "outline" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="border-gray-600"
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            {audioEnabled ? 'Mute' : 'Unmute'}
          </Button>
          
          <Button
            variant={screenSharing ? "destructive" : "outline"}
            size="lg"
            onClick={() => {/* Screen sharing logic */}}
            className="border-gray-600"
          >
            <ScreenShare className="h-5 w-5" />
            {screenSharing ? 'Stop Sharing' : 'Share Screen'}
          </Button>
        </div>
      </div>
    </div>
  );
};