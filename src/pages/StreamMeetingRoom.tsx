import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { API_URL } from '@/config/env';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  CallingState,
  useCallStateHooks,
  ParticipantView,
  useCall,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Users,
  PhoneOff,
  Send,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface ChatMessage {
  id: number;
  userName: string;
  message: string;
  timestamp: string;
  userId?: string;
}

// Custom call UI component
const MeetingUI: React.FC<{
  onLeave: () => void;
  lectureId: string;
  userName: string;
  userId: string;
}> = ({ onLeave, lectureId, userName, userId }) => {
  const call = useCall();
  const { useCallCallingState, useParticipantCount, useLocalParticipant, useRemoteParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Handle custom chat (Stream has built-in chat, but this is a simple implementation)
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now(),
      userName,
      message: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
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

  const handleLeave = useCallback(async () => {
    if (confirm('Are you sure you want to leave the meeting?')) {
      try {
        await call?.leave();
        onLeave();
      } catch (error) {
        console.error('Error leaving call:', error);
        onLeave();
      }
    }
  }, [call, onLeave]);

  if (callingState === CallingState.LEFT) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You left the meeting</h2>
          <Button onClick={onLeave} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Meeting Room</h1>
          <span className="text-sm text-gray-400">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </span>
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
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <Users className="h-4 w-4" />
            {participantCount}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLeave}
          >
            <PhoneOff className="h-4 w-4" />
            Leave
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Main video area */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} p-4 transition-all duration-300`}>
          <StreamTheme>
            <SpeakerLayout participantsBarPosition="bottom" />
          </StreamTheme>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
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
                      message.userId === userId 
                        ? 'bg-blue-600 ml-auto max-w-[80%]' 
                        : 'bg-gray-700 max-w-[80%]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium ${
                        message.userId === userId ? 'text-blue-100' : 'text-gray-300'
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
                />
                <Button 
                  onClick={sendMessage} 
                  size="sm"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls - mic, camera, screen share, leave (CallControls includes all) */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center">
          <StreamTheme>
            <CallControls onLeave={handleLeave} />
          </StreamTheme>
        </div>
      </div>
    </div>
  );
};

export const StreamMeetingRoom: React.FC = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<ReturnType<StreamVideoClient['call']> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get dashboard path based on role
  const getDashboardPath = useCallback(() => {
    return user?.role === 'trainer' 
      ? '/trainer/dashboard' 
      : user?.role === 'admin' 
        ? '/admin/dashboard' 
        : '/student/dashboard';
  }, [user?.role]);

  const callRef = React.useRef<ReturnType<StreamVideoClient['call']> | null>(null);
  const clientRef = React.useRef<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!user || !lectureId) {
      navigate(getDashboardPath());
      return;
    }

    let cancelled = false;

    const initializeStream = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const authToken = localStorage.getItem('upscholer_token');
        if (!authToken) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/stream/token`, {
          headers: { 'x-auth-token': authToken },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to get video token');
        }

        const { token: streamToken, apiKey, userId } = await response.json();

        if (!apiKey || !streamToken) {
          throw new Error('Video service not properly configured');
        }

        const userName = `${(user as any).firstname ?? user?.firstName ?? ''} ${(user as any).lastname ?? user?.lastName ?? ''}`.trim() || user?.email || 'Participant';

        const videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: userId,
            name: userName,
            image: user.avatar,
          },
          token: streamToken,
        });

        const videoCall = videoClient.call('default', lectureId);
        await videoCall.join({ create: true });

        if (cancelled) {
          videoCall.leave().catch(console.error);
          videoClient.disconnectUser().catch(console.error);
          return;
        }

        clientRef.current = videoClient;
        callRef.current = videoCall;
        setClient(videoClient);
        setCall(videoCall);
        setIsLoading(false);
        toast.success('Connected to meeting');
      } catch (err) {
        if (!cancelled) {
          console.error('Error initializing Stream:', err);
          setError(err instanceof Error ? err.message : 'Failed to connect to meeting');
          setIsLoading(false);
          toast.error('Failed to connect to meeting');
        }
      }
    };

    initializeStream();

    return () => {
      cancelled = true;
      const c = callRef.current;
      const cl = clientRef.current;
      callRef.current = null;
      clientRef.current = null;
      if (c) c.leave().catch(console.error);
      if (cl) cl.disconnectUser().catch(console.error);
    };
  }, [user, lectureId, navigate, getDashboardPath]);

  const handleLeave = useCallback(() => {
    navigate(getDashboardPath());
  }, [navigate, getDashboardPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connecting to meeting...</h2>
          <p className="text-gray-400">Please wait while we set up your video call</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => navigate(getDashboardPath())} variant="default">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Setting up video call...</h2>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <MeetingUI 
          onLeave={handleLeave}
          lectureId={lectureId || ''}
          userName={`${(user as any)?.firstname ?? user?.firstName ?? ''} ${(user as any)?.lastname ?? user?.lastName ?? ''}`.trim() || user?.email || 'You'}
          userId={user?.id || ''}
        />
      </StreamCall>
    </StreamVideo>
  );
};

export default StreamMeetingRoom;

