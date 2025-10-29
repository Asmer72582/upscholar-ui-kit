import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
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
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
      toast.error('Invalid meeting access');
      navigate('/');
      return;
    }

    initializeMeeting();

    return () => {
      cleanup();
    };
  }, []);

  const initializeMeeting = async () => {
    try {
      console.log('Initializing meeting...');
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('Got local stream:', stream.id);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Connect to socket
      console.log('Connecting to Socket.io server...');
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

      newSocket.emit('join-meeting', {
        meetingId: lectureId,
        userId: (user as any).id || (user as any)._id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role
      });

      newSocket.on('meeting-joined', ({ participants: existingParticipants, whiteboard, chat, isHost: host }) => {
        console.log('Meeting joined! Existing participants:', existingParticipants.length);
        setParticipants(existingParticipants);
        setIsHost(host);
        setMessages(chat);
        
        // Connect to existing participants
        existingParticipants.forEach((participant: Participant) => {
          console.log('Creating peer connection to:', participant.userName);
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
        console.log('New user joined:', userName, 'socketId:', socketId);
        setParticipants(prev => [...prev, { socketId, userId, userName, userRole, video: true, audio: true, screen: false }]);
        
        // Small delay to ensure socket is ready
        setTimeout(() => {
          console.log('Creating peer for new user:', userName);
          createPeer(socketId, newSocket, stream, true);
        }, 500);
        
        toast.info(`${userName} joined the meeting`);
      });

      newSocket.on('user-left', ({ socketId }) => {
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        const peerConnection = peersRef.current.get(socketId);
        if (peerConnection) {
          peerConnection.peer.destroy();
          peersRef.current.delete(socketId);
          setPeers(new Map(peersRef.current));
        }
      });

      newSocket.on('offer', ({ from, offer }) => {
        console.log('Received offer from:', from);
        createPeer(from, newSocket, stream, false, offer);
      });

      newSocket.on('answer', ({ from, answer }) => {
        console.log('Received answer from:', from);
        const peerConnection = peersRef.current.get(from);
        if (peerConnection) {
          peerConnection.peer.signal(answer);
        } else {
          console.warn('No peer connection found for:', from);
        }
      });

      newSocket.on('ice-candidate', ({ from, candidate }) => {
        console.log('Received ICE candidate from:', from);
        const peerConnection = peersRef.current.get(from);
        if (peerConnection) {
          peerConnection.peer.signal(candidate);
        } else {
          console.warn('No peer connection found for ICE candidate from:', from);
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

      // Whiteboard
      newSocket.on('whiteboard-draw', (data) => {
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

      newSocket.on('whiteboard-sync', (whiteboard) => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            whiteboard.forEach((data: any) => {
              drawOnCanvas(ctx, data);
            });
          }
        }
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
      console.error('Error initializing meeting:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const createPeer = (
    socketId: string,
    socket: Socket,
    stream: MediaStream,
    initiator: boolean,
    offer?: any
  ) => {
    console.log(`Creating peer connection - socketId: ${socketId}, initiator: ${initiator}`);
    
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
      console.log(`Sending ${initiator ? 'offer' : 'answer'} to:`, socketId);
      if (initiator) {
        socket.emit('offer', { to: socketId, offer: signal });
      } else {
        socket.emit('answer', { to: socketId, answer: signal });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log('✅ Received remote stream from:', socketId, 'Tracks:', remoteStream.getTracks().length);
      remoteStream.getTracks().forEach(track => {
        console.log('  - Track:', track.kind, 'enabled:', track.enabled);
      });
      
      const peerConnection = peersRef.current.get(socketId);
      if (peerConnection) {
        peerConnection.stream = remoteStream;
        setPeers(new Map(peersRef.current));
      }
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
      console.log('Signaling with offer from:', socketId);
      peer.signal(offer);
    }

    const peerConnection: PeerConnection = { peer };
    peersRef.current.set(socketId, peerConnection);
    setPeers(new Map(peersRef.current));
    
    console.log('Peer connection created and stored for:', socketId);
  };

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
          peersRef.current.forEach(({ peer }) => {
            const sender = peer._pc.getSenders().find((s: any) => s.track?.kind === 'video');
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          });
        }
      }
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        } as any);
        
        setScreenStream(stream);
        setScreenSharing(true);
        
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        
        // Replace camera track with screen track in all peer connections
        const screenTrack = stream.getVideoTracks()[0];
        peersRef.current.forEach(({ peer }) => {
          const sender = peer._pc.getSenders().find((s: any) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });
        
        socket?.emit('start-screen-share', { meetingId: lectureId });
        console.log('Screen sharing started and sent to all peers');

        // Handle screen share stop (when user clicks "Stop Sharing" in browser)
        screenTrack.onended = () => {
          setScreenSharing(false);
          setScreenStream(null);
          socket?.emit('stop-screen-share', { meetingId: lectureId });
          
          // Restore camera
          if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            peersRef.current.forEach(({ peer }) => {
              const sender = peer._pc.getSenders().find((s: any) => s.track?.kind === 'video');
              if (sender && videoTrack) {
                sender.replaceTrack(videoTrack);
              }
            });
          }
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast.error('Failed to share screen');
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && user) {
      socket.emit('send-message', {
        meetingId: lectureId,
        message: newMessage,
        userName: `${user.firstName} ${user.lastName}`
      });
      setNewMessage('');
    }
  };

  // Whiteboard functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : drawColor;
        ctx.lineWidth = tool === 'eraser' ? 20 : drawWidth;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();

        // Emit to other users
        socket?.emit('whiteboard-draw', {
          meetingId: lectureId,
          data: {
            x,
            y,
            color: tool === 'eraser' ? '#FFFFFF' : drawColor,
            width: tool === 'eraser' ? 20 : drawWidth,
            tool
          }
        });
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const drawOnCanvas = (ctx: CanvasRenderingContext2D, data: any) => {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
  };

  const clearWhiteboard = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        socket?.emit('whiteboard-clear', { meetingId: lectureId });
      }
    }
  };

  const undoWhiteboard = () => {
    socket?.emit('whiteboard-undo', { meetingId: lectureId });
  };

  const leaveMeeting = () => {
    cleanup();
    navigate('/');
  };

  const endMeeting = () => {
    if (isHost) {
      socket?.emit('end-meeting', { meetingId: lectureId });
      cleanup();
      navigate('/');
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    peersRef.current.forEach(({ peer }) => peer.destroy());
    socket?.disconnect();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="text-white">
          <h1 className="text-xl font-bold">Live Lecture</h1>
          <p className="text-sm text-gray-400">{participants.length + 1} participants</p>
        </div>
        <div className="flex gap-2">
          {isHost && (
            <Button variant="destructive" onClick={endMeeting}>
              End Meeting
            </Button>
          )}
          <Button variant="destructive" onClick={leaveMeeting}>
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className={`p-4 overflow-auto ${isHost && activeTab === 'whiteboard' ? 'w-1/2' : 'flex-1'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Screen Share Display - Shows when anyone is sharing */}
            {(screenSharing || participants.some(p => p.screen)) && (
              <div className="col-span-full mb-4">
                <Card className="bg-gray-800 border-green-500 border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-green-500" />
                        <p className="text-white font-semibold">
                          {screenSharing ? 'You are sharing your screen' : 'Screen being shared'}
                        </p>
                      </div>
                      {screenSharing && (
                        <Button size="sm" variant="destructive" onClick={toggleScreenShare}>
                          <MonitorOff className="w-4 h-4 mr-2" />
                          Stop Sharing
                        </Button>
                      )}
                    </div>
                    {screenSharing && (
                      <video
                        ref={screenVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-auto rounded bg-black"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

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
        </div>

        {/* Sidebar */}
        <div className={`bg-gray-800 border-l border-gray-700 ${isHost && activeTab === 'whiteboard' ? 'w-1/2' : 'w-80'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className={`grid w-full ${isHost ? 'grid-cols-3' : 'grid-cols-2'} bg-gray-700`}>
              <TabsTrigger value="participants">
                <Users className="w-4 h-4 mr-2" />
                People
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              {isHost && (
                <TabsTrigger value="whiteboard">
                  <Palette className="w-4 h-4 mr-2" />
                  Board
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="participants" className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {[...participants, { socketId: 'local', userName: `${user?.firstName} ${user?.lastName} (You)`, userRole: user?.role, video: videoEnabled, audio: audioEnabled }].map((p) => (
                  <div key={p.socketId} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                        {p.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm">{p.userName}</p>
                        <p className="text-gray-400 text-xs capitalize">{p.userRole}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {p.audio ? (
                        <Mic className="w-4 h-4 text-green-500" />
                      ) : (
                        <MicOff className="w-4 h-4 text-red-500" />
                      )}
                      {p.video ? (
                        <Video className="w-4 h-4 text-green-500" />
                      ) : (
                        <VideoOff className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-gray-700 p-2 rounded">
                    <p className="text-white text-sm font-semibold">{msg.userName}</p>
                    <p className="text-gray-300 text-sm">{msg.message}</p>
                    <p className="text-gray-500 text-xs">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="bg-gray-700 text-white border-gray-600"
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {isHost && (
              <TabsContent value="whiteboard" className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-white font-semibold mb-3">Whiteboard Controls</h3>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={tool === 'pen' ? 'default' : 'outline'}
                      onClick={() => setTool('pen')}
                    >
                      <Palette className="w-4 h-4 mr-1" />
                      Pen
                    </Button>
                    <Button
                      size="sm"
                      variant={tool === 'eraser' ? 'default' : 'outline'}
                      onClick={() => setTool('eraser')}
                    >
                      <Eraser className="w-4 h-4 mr-1" />
                      Eraser
                    </Button>
                    <div className="flex items-center gap-2">
                      <label className="text-white text-sm">Color:</label>
                      <input
                        type="color"
                        value={drawColor}
                        onChange={(e) => setDrawColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                      <label className="text-white text-sm">Width:</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={drawWidth}
                        onChange={(e) => setDrawWidth(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-white text-sm">{drawWidth}px</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={undoWhiteboard}>
                      <Undo className="w-4 h-4 mr-1" />
                      Undo
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearWhiteboard}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-auto bg-gray-900">
                  <canvas
                    ref={canvasRef}
                    width={1600}
                    height={900}
                    className="w-full h-full bg-white rounded cursor-crosshair shadow-lg"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
        <Button
          variant={audioEnabled ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-14 h-14"
        >
          {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        <Button
          variant={videoEnabled ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-14 h-14"
        >
          {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
        <Button
          variant={screenSharing ? 'default' : 'outline'}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full w-14 h-14"
        >
          {screenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
};
