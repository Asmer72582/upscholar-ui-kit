import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import io, { Socket } from 'socket.io-client';
import Peer from 'vite-compatible-simple-peer';
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
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import '@/styles/meeting-room-enhanced.css';

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
  userId?: string;
}

interface WhiteboardData {
  x: number;
  y: number;
  color: string;
  width: number;
  type: 'eraser' | 'draw';
}

interface PeerConnection {
  peer: Peer.Instance;
  stream?: MediaStream;
}

export const MeetingRoomEnhanced: React.FC = () => {
  console.log('MeetingRoomEnhanced component loaded');
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Debug user changes
  useEffect(() => {
    console.log('🔄 User object changed:', user?.id, user?.firstName, user?.lastName);
  }, [user]);

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
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Handle local stream availability for peer creation
  useEffect(() => {
    if (localStream && socket && participants.length > 0) {
      console.log('📹 Local stream now available, creating peers for existing participants');
      participants.forEach((participant) => {
        if (participant.socketId !== socket.id && !peersRef.current.has(participant.socketId)) {
          console.log('🔄 Creating peer for participant:', participant.userName);
          createPeer(participant.socketId, socket, localStream, true);
        }
      });
    }
  }, [localStream, socket, participants.length]);

  // Handle delayed peer creation when stream becomes available
  useEffect(() => {
    if (localStream && socket) {
      // Check for any pending peer creation requests
      const pendingPeers = participants.filter(p => 
        p.socketId !== socket.id && 
        !peersRef.current.has(p.socketId) &&
        (window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests?.has(p.socketId)
      );
      
      if (pendingPeers.length > 0) {
        console.log('🔄 Creating peers for pending requests:', pendingPeers.length);
        pendingPeers.forEach(participant => {
          createPeer(participant.socketId, socket, localStream, true);
          (window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests?.delete(participant.socketId);
        });
      }
    }
  }, [localStream, socket]);

  // Handle local stream changes for video element
  useEffect(() => {
    console.log('📹 Local stream changed:', localStream?.id);
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      console.log('📺 Local video element updated with new stream');
      
      // Try to play the video
      const playVideo = async () => {
        try {
          // Check if video is ready before playing
          if (localVideoRef.current?.readyState >= 2) {
            await localVideoRef.current.play();
            console.log('📺 Local video started playing successfully');
          } else {
            console.log('📺 Video not ready for playback yet');
          }
        } catch (error) {
          console.error('📺 Error playing local video:', error);
          // Don't try immediate fallback to avoid interruption errors
        }
      };
      
      // Check if video is playing
      localVideoRef.current.onloadedmetadata = () => {
        console.log('📺 Local video metadata loaded');
        console.log('📺 Video dimensions:', localVideoRef.current?.videoWidth, 'x', localVideoRef.current?.videoHeight);
        playVideo();
      };
      
      localVideoRef.current.onplay = () => {
        console.log('📺 Local video started playing');
      };
      
      localVideoRef.current.onerror = (e) => {
        console.error('📺 Local video error:', e);
      };
      
      // Try to play immediately if metadata is already loaded
      if (localVideoRef.current.readyState >= 2) {
        console.log('📺 Video readyState >= 2, trying to play immediately');
        playVideo();
      }
    } else {
      console.log('📹 Local stream or video ref not available:', {
        hasStream: !!localStream,
        hasVideoRef: !!localVideoRef.current
      });
    }
  }, [localStream]);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showChat, setShowChat] = useState(true);

  // Whiteboard
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#000000');
  const [drawWidth, setDrawWidth] = useState(2);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // UI
  const [activeTab, setActiveTab] = useState('participants');

  // Calculate video layout based on participant count
  const getVideoLayout = () => {
    const totalParticipants = participants.length + 1; // +1 for local user
    
    if (totalParticipants <= 1) {
      return { gridCols: 'grid-cols-1', gridRows: 'grid-rows-1', videoHeight: 'h-full' };
    } else if (totalParticipants <= 2) {
      return { gridCols: 'grid-cols-2', gridRows: 'grid-rows-1', videoHeight: 'h-full' };
    } else if (totalParticipants <= 4) {
      return { gridCols: 'grid-cols-2', gridRows: 'grid-rows-2', videoHeight: 'h-[calc(50%-0.5rem)]' };
    } else if (totalParticipants <= 6) {
      return { gridCols: 'grid-cols-3', gridRows: 'grid-rows-2', videoHeight: 'h-[calc(50%-0.5rem)]' };
    } else if (totalParticipants <= 9) {
      return { gridCols: 'grid-cols-3', gridRows: 'grid-rows-3', videoHeight: 'h-[calc(33.333%-0.5rem)]' };
    } else {
      return { gridCols: 'grid-cols-4', gridRows: 'grid-rows-3', videoHeight: 'h-[calc(33.333%-0.5rem)]' };
    }
  };

  const videoLayout = getVideoLayout();

  // Debug current state
  useEffect(() => {
    console.log('🔄 Component state update:');
    console.log('  - Participants:', participants.length, participants.map(p => ({name: p.userName, socketId: p.socketId})));
    console.log('  - Peers:', peers.size, Array.from(peers.keys()));
    console.log('  - Is Connected:', isConnected);
  }, [participants, peers, isConnected]);

  useEffect(() => {
    console.log('🔄 Main useEffect triggered - user:', user?.id, 'lectureId:', lectureId);
    if (!user || !lectureId) {
      navigate('/dashboard');
      return;
    }

    initializeMeeting();

    return () => {
      cleanupMeeting();
    };
  }, [user, lectureId]);

  const initializeMeeting = async () => {
    try {
      setConnectionError(null);
      
      console.log('📹 Starting media stream initialization...');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      console.log('✅ Media stream obtained:', stream.id);
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', stream.getAudioTracks().length);
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('📺 Local video element updated with stream');
      } else {
        console.log('⚠️ Local video ref not available yet');
      }

      // Connect to socket
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true,
        query: {
          lectureId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userRole: user.role
        }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('✅ Connected to socket server');
        console.log('📋 Socket ID:', newSocket.id);
        console.log('🔗 Transport:', newSocket.io.engine.transport.name);
        setIsConnected(true);
        setConnectionError(null);
        setConnectionDetails(`Connected as ${user.firstName} ${user.lastName} (${user.role})`);
        toast.success('Connected to meeting room');
        
        // Join the meeting room
        console.log('📡 Joining meeting room:', lectureId);
        newSocket.emit('join-meeting', {
          meetingId: lectureId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userRole: user.role
        });
        
        // The backend will automatically send meeting-joined event when we connect
        setConnectionDetails('Connected - joining meeting room...');
      });

      // Instead of requesting room state, wait for meeting-joined event
      newSocket.on('meeting-joined', ({ participants: roomParticipants, whiteboard, chat, isHost }) => {
        console.log('📋 RECEIVED MEETING-JOINED EVENT');
        console.log('📋 Received meeting state:', roomParticipants.length, 'participants');
        console.log('👑 Is host:', isHost);
        console.log('🙋 Current user ID:', user.id);
        
        setParticipants(roomParticipants);
        setIsHost(isHost);
        
        // Create peers for existing participants
        roomParticipants.forEach((participant: Participant) => {
          if (participant.socketId !== newSocket.id) {
            console.log('🔄 Creating peer for existing participant:', participant.userName);
            setTimeout(() => {
              // Use localStream state instead of the stream parameter
              if (localStream) {
                createPeer(participant.socketId, newSocket, localStream, true);
              } else {
                console.log('⚠️ Local stream not available yet for existing participant, adding to pending requests...');
                // Add to pending peer requests
                if (!(window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests) {
                  (window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests = new Set();
                }
                (window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests!.add(participant.socketId);
              }
            }, 500);
          }
        });
        
        setConnectionDetails(`Connected to room with ${roomParticipants.length} participants`);
      });

      // Handle current participants list
      newSocket.on('participants-list', ({ participants: currentParticipants }) => {
        console.log('👥 Current participants:', currentParticipants.length);
        setParticipants(currentParticipants);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('❌ Error details:', error.message);
        setConnectionError(`Failed to connect to meeting server: ${error.message}`);
        setConnectionDetails(`Error: ${error.name || 'Unknown error'}`);
        toast.error('Connection failed. Retrying...');
        setIsConnected(false);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from socket server:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          toast.error('Disconnected from server');
        } else if (reason === 'io client disconnect') {
          toast.info('Disconnected from meeting');
        } else {
          toast.warning('Connection lost. Attempting to reconnect...');
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to socket server (attempt:', attemptNumber + ')');
        toast.success('Reconnected to meeting');
        setIsConnected(true);
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt:', attemptNumber);
      });

      newSocket.on('user-joined', ({ socketId, userId, userName, userRole }) => {
        console.log('👤 User joined:', userName, 'Socket ID:', socketId);
        console.log('📊 Current participants before:', participants.length);
        setParticipants(prev => {
          const updated = [...prev, { socketId, userId, userName, userRole, video: true, audio: true, screen: false }];
          console.log('📊 Current participants after:', updated.length);
          return updated;
        });
        
        setTimeout(() => {
          // Use localStream state instead of the stream parameter
          if (localStream) {
            createPeer(socketId, newSocket, localStream, true);
          } else {
            console.log('⚠️ Local stream not available yet for new user, adding to pending requests...');
            // Add to pending peer requests
            if (!(window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests) {
              (window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests = new Set();
            }
            (window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests!.add(socketId);
          }
        }, 500);
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
        // Use localStream state instead of the stream parameter
        if (localStream) {
          createPeer(from, newSocket, localStream, false, offer);
        } else {
          console.log('⚠️ Local stream not available yet for offer, adding to pending requests...');
          // Add to pending peer requests
          if (!(window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests) {
            (window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests = new Set();
          }
          (window as {_pendingPeerRequests?: Set<string>})._pendingPeerRequests!.add(from);
        }
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

      newSocket.on('chat-message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        if (activeTab !== 'chat') {
          setUnreadMessages(prev => prev + 1);
        }
        // Scroll to bottom
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });

      newSocket.on('participant-updated', ({ socketId, video, audio, screen }) => {
        setParticipants(prev => prev.map(p => 
          p.socketId === socketId ? { ...p, video, audio, screen } : p
        ));
      });

      newSocket.on('whiteboard-update', (data) => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            drawOnCanvas(ctx, data);
          }
        }
      });

      newSocket.on('whiteboard-clear', () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      });

      newSocket.on('screen-share-started', ({ userId, userName }) => {
        toast.info(`${userName} started screen sharing`);
      });

      newSocket.on('screen-share-stopped', ({ userId, userName }) => {
        toast.info(`${userName} stopped screen sharing`);
      });

    } catch (error) {
      console.error('❌ Error initializing meeting:', error);
      setConnectionError('Failed to access camera/microphone. Please check permissions.');
      toast.error('Failed to access camera/microphone');
      
      // Log specific error details
      if (error instanceof Error) {
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        if ('constraint' in error) {
          console.error('❌ Constraint:', error.constraint);
        }
      }
    }
  };

  const cleanupMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (socket) {
      socket.disconnect();
    }
    peersRef.current.forEach(({ peer }) => peer.destroy());
    peersRef.current.clear();
    setPeers(new Map());
  };

  const createPeer = (socketId: string, socket: Socket, stream: MediaStream, initiator: boolean, offer?: Peer.SignalData) => {
    console.log('🔧 Creating peer for socket:', socketId, 'Initiator:', initiator);
    console.log('📹 Stream provided to createPeer:', stream?.id, 'Tracks:', stream?.getTracks().length);
    
    const peer = new Peer({
      initiator: initiator,
      trickle: false,
      stream: stream
    });

    if (offer) {
      console.log('📨 Signaling offer to peer:', socketId);
      peer.signal(offer);
    }

    peer.on('signal', (data) => {
      console.log('📡 Peer signal event:', data.type, 'for socket:', socketId);
      if (data.type === 'offer') {
        socket.emit('offer', { to: socketId, offer: data });
      } else if (data.type === 'answer') {
        socket.emit('answer', { to: socketId, answer: data });
      } else if (data.type === 'candidate') {
        socket.emit('ice-candidate', { to: socketId, candidate: data });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log('📹 Received remote stream from:', socketId);
      console.log('🔍 Participant state for socketId:', participants.find(p => p.socketId === socketId));
      setPeers(prev => new Map(prev.set(socketId, { peer, stream: remoteStream })));
      peersRef.current.set(socketId, { peer, stream: remoteStream });
    });

    peer.on('error', (error) => {
      console.error('❌ Peer error for socket', socketId, ':', error);
    });

    peer.on('connect', () => {
      console.log('🔗 Peer connection established with:', socketId);
    });

    peer.on('close', () => {
      console.log('🔚 Peer connection closed with:', socketId);
    });

    peersRef.current.set(socketId, { peer });
    setPeers(prev => new Map(prev.set(socketId, { peer })));
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
        
        if (socket) {
          socket.emit('update-participant', { video: !videoEnabled, audio: audioEnabled, screen: screenSharing });
        }
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
        
        if (socket) {
          socket.emit('update-participant', { video: videoEnabled, audio: !audioEnabled, screen: screenSharing });
        }
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        setScreenStream(stream);
        setScreenSharing(true);
        
        if (socket) {
          socket.emit('update-participant', { video: videoEnabled, audio: audioEnabled, screen: true });
          socket.emit('screen-share-started', { userId: user.id, userName: `${user.firstName} ${user.lastName}` });
        }

        stream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          setScreenStream(null);
          if (socket) {
            socket.emit('update-participant', { video: videoEnabled, audio: audioEnabled, screen: false });
            socket.emit('screen-share-stopped', { userId: user.id, userName: `${user.firstName} ${user.lastName}` });
          }
        };
      } else {
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
        }
        setScreenStream(null);
        setScreenSharing(false);
        
        if (socket) {
          socket.emit('update-participant', { video: videoEnabled, audio: audioEnabled, screen: false });
          socket.emit('screen-share-stopped', { userId: user.id, userName: `${user.firstName} ${user.lastName}` });
        }
      }
    } catch (error) {
      console.error('❌ Screen share error:', error);
      toast.error('Failed to share screen');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !isConnected) return;
    
    const message: ChatMessage = {
      id: Date.now(),
      userName: `${user.firstName} ${user.lastName}`,
      message: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: user.id
    };
    
    socket.emit('chat-message', message);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const copyMeetingUrl = async () => {
    const meetingUrl = `${window.location.origin}/meeting/${lectureId}`;
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      toast.success('Meeting URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const leaveMeeting = () => {
    if (confirm('Are you sure you want to leave the meeting?')) {
      cleanupMeeting();
      navigate('/dashboard');
    }
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
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      
      if (socket) {
        socket.emit('whiteboard-update', {
          x,
          y,
          color: drawColor,
          width: drawWidth,
          type: tool
        });
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const drawOnCanvas = (ctx: CanvasRenderingContext2D, data: WhiteboardData) => {
    ctx.globalCompositeOperation = data.type === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (socket) {
        socket.emit('whiteboard-clear');
      }
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadMessages(0);
    }
  }, [activeTab]);

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-300 mb-4">{connectionError}</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Connecting to meeting...</h2>
          <p className="text-gray-400 mb-4">Please wait while we connect you to the meeting room</p>
          {connectionDetails && (
            <div className="bg-gray-800 p-3 rounded-lg text-sm text-gray-300">
              <p className="font-medium">Connection Details:</p>
              <p>{connectionDetails}</p>
            </div>
          )}
          {connectionError && (
            <div className="bg-red-900/20 border border-red-800 p-3 rounded-lg text-sm text-red-300 mt-4">
              <p className="font-medium">Error:</p>
              <p>{connectionError}</p>
            </div>
          )}
          <div className="mt-6 text-xs text-gray-500">
            <p>Lecture ID: {lectureId}</p>
            <p>User: {user?.firstName} {user?.lastName} ({user?.role})</p>
            <p>Socket URL: {SOCKET_URL}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalParticipants = participants.length + 1;

  console.log('🎥 MAIN RENDER - Current state:', {
    totalParticipants,
    videoEnabled,
    audioEnabled,
    localStream: !!localStream,
    localStreamId: localStream?.id,
    localVideoRef: !!localVideoRef.current,
    participants: participants.length,
    peers: peers.size
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Meeting Room</h1>
          {isHost && <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">Host</span>}
          <span className="text-sm text-gray-400">
            {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
          </span>
          <div className="text-xs text-gray-500">
            Socket: {socket?.id?.slice(-6) || 'N/A'} | Transport: {socket?.io?.engine?.transport?.name || 'N/A'}
          </div>
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
            className="border-gray-600 relative"
          >
            <MessageSquare className="h-4 w-4" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <Users className="h-4 w-4" />
            {totalParticipants}
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main video area */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} p-4 transition-all duration-300`}>
          <div className={`grid ${videoLayout.gridCols} gap-2 h-full`}>
            {/* Local video */}
            {console.log('🎥 Rendering local video section - videoEnabled:', videoEnabled, 'localStream:', !!localStream)}
            <div className={`relative ${videoLayout.videoHeight} bg-gray-800 rounded-lg overflow-hidden`}>
              <video
                ref={(video) => {
                  localVideoRef.current = video;
                  console.log('📺 Local video element mounted:', !!video);
                  if (video && localStream) {
                    console.log('📺 Setting local video srcObject, stream ID:', localStream.id);
                    video.srcObject = localStream;
                    
                    // Handle video playback properly to avoid interruption errors
                    const setupVideoPlayback = async () => {
                      try {
                        // Wait for the video to be ready
                        if (video.readyState >= 2) {
                          console.log('📺 Video readyState >= 2, playing immediately');
                          await video.play();
                          console.log('📺 Local video started playing successfully');
                        } else {
                          console.log('📺 Video not ready yet, waiting for loadedmetadata');
                          video.addEventListener('loadedmetadata', async () => {
                            console.log('📺 Video metadata loaded, attempting to play');
                            try {
                              await video.play();
                              console.log('📺 Local video started playing after metadata loaded');
                            } catch (playError) {
                              console.error('📺 Error playing local video after metadata:', playError);
                            }
                          }, { once: true });
                        }
                      } catch (error) {
                        console.error('📺 Error in video playback setup:', error);
                      }
                    };
                    
                    setupVideoPlayback();
                  }
                }}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/70 px-2 py-1 rounded text-white text-sm flex items-center gap-2">
                <span>You ({user.firstName} {user.lastName})</span>
                {!audioEnabled && <MicOff className="w-3 h-3" />}
              </div>
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Camera off</p>
                  </div>
                </div>
              )}
              {screenSharing && (
                <div className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs">
                  Sharing Screen
                </div>
              )}
            </div>

            {/* Remote videos */}
            {Array.from(peers.entries()).map(([socketId, { stream }]) => {
              const participant = participants.find(p => p.socketId === socketId);
              console.log('🎥 Rendering video for:', participant?.userName, 'Socket:', socketId, 'Stream:', stream?.id);
              return (
                <div key={socketId} className={`relative ${videoLayout.videoHeight} bg-gray-800 rounded-lg overflow-hidden`}>
                  <video
                    ref={(video) => {
                      if (video && stream) {
                        console.log('📺 Setting video srcObject for:', participant?.userName, 'Stream ID:', stream.id);
                        video.srcObject = stream;
                        
                        // Handle video playback properly to avoid interruption errors
                        const setupRemoteVideoPlayback = async () => {
                          try {
                            // Wait for the video to be ready
                            if (video.readyState >= 2) {
                              console.log('📺 Remote video readyState >= 2, playing immediately for:', participant?.userName);
                              await video.play();
                              console.log('📺 Remote video started playing successfully for:', participant?.userName);
                            } else {
                              console.log('📺 Remote video not ready yet, waiting for loadedmetadata for:', participant?.userName);
                              video.addEventListener('loadedmetadata', async () => {
                                console.log('📺 Remote video metadata loaded for:', participant?.userName, ', attempting to play');
                                try {
                                  await video.play();
                                  console.log('📺 Remote video started playing after metadata loaded for:', participant?.userName);
                                } catch (playError) {
                                  console.error('📺 Error playing remote video after metadata for:', participant?.userName, ':', playError);
                                }
                              }, { once: true });
                            }
                          } catch (error) {
                            console.error('📺 Error in remote video playback setup for:', participant?.userName, ':', error);
                          }
                        };
                        
                        setupRemoteVideoPlayback();
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/70 px-2 py-1 rounded text-white text-sm flex items-center gap-2">
                    <span>{participant?.userName || 'Unknown'}</span>
                    {participant && !participant.audio && <MicOff className="w-3 h-3" />}
                  </div>
                  {!participant?.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                      <div className="text-center">
                        <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Camera off</p>
                      </div>
                    </div>
                  )}
                  {participant?.screen && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs">
                      Sharing Screen
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-3 rounded-lg ${
                      message.userId === user.id 
                        ? 'bg-blue-600 ml-auto max-w-[80%]' 
                        : 'bg-gray-700 max-w-[80%]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium ${
                        message.userId === user.id ? 'text-blue-100' : 'text-gray-300'
                      }`}>
                        {message.userName}
                      </span>
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                    </div>
                    <p className="text-sm break-words">{message.message}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  disabled={!isConnected}
                />
                <Button 
                  onClick={sendMessage} 
                  size="sm"
                  disabled={!isConnected || !newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={videoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="flex items-center space-x-2"
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{videoEnabled ? 'Stop' : 'Start'} Video</span>
          </Button>
          
          <Button
            variant={audioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="flex items-center space-x-2"
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Mute' : 'Unmute'}</span>
          </Button>
          
          <Button
            variant={screenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className="flex items-center space-x-2"
          >
            {screenSharing ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{screenSharing ? 'Stop' : 'Share'} Screen</span>
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={leaveMeeting}
            className="flex items-center space-x-2"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </div>
    </div>
  );
};