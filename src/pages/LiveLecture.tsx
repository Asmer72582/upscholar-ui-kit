import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Monitor, 
  Users, 
  MessageCircle, 
  Settings, 
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Maximize,
  Hand,
  FileText,
  Download
} from 'lucide-react';

const lectureData = {
  id: '123',
  title: 'Introduction to React Hooks',
  trainer: {
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b2e5?w=100&h=100&fit=crop&crop=face'
  },
  startTime: '2:00 PM',
  duration: 90,
  attendees: 25,
  maxAttendees: 50
};

const chatMessages = [
  {
    id: 1,
    user: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    message: 'Great explanation of useState!',
    timestamp: '2:15 PM',
    isTrainer: false
  },
  {
    id: 2,
    user: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b2e5?w=100&h=100&fit=crop&crop=face',
    message: 'Thanks! Any questions about useEffect?',
    timestamp: '2:16 PM',
    isTrainer: true
  },
  {
    id: 3,
    user: 'Sarah Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    message: 'Can you show the cleanup function example?',
    timestamp: '2:17 PM',
    isTrainer: false
  }
];

const attendeesList = [
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isTrainer: false,
    handRaised: false,
    isMuted: true
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isTrainer: false,
    handRaised: true,
    isMuted: true
  },
  {
    id: 3,
    name: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isTrainer: false,
    handRaised: false,
    isMuted: false
  }
];

export const LiveLecture: React.FC = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(chatMessages);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'You',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTrainer: false
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const leaveLecture = () => {
    navigate('/student/my-lectures');
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold">{lectureData.title}</h1>
              <p className="text-sm text-muted-foreground">
                with {lectureData.trainer.name} • {lectureData.attendees}/{lectureData.maxAttendees} attendees
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Live
            </Badge>
            <Button variant="destructive" onClick={leaveLecture}>
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Video */}
          <div className="flex-1 bg-gray-900 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium">{lectureData.trainer.name}</p>
                <p className="text-sm opacity-75">Trainer Video</p>
              </div>
            </div>
            
            {/* Trainer Avatar in Corner */}
            <div className="absolute top-4 left-4">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={lectureData.trainer.avatar} />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 bg-black/50 rounded-lg p-2">
                <Button
                  size="sm"
                  variant={isMuted ? "destructive" : "secondary"}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant={isCameraOff ? "destructive" : "secondary"}
                  onClick={() => setIsCameraOff(!isCameraOff)}
                >
                  {isCameraOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant={isHandRaised ? "default" : "secondary"}
                  onClick={() => setIsHandRaised(!isHandRaised)}
                  className={isHandRaised ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                >
                  <Hand className="w-4 h-4" />
                </Button>
                
                <Button size="sm" variant="secondary">
                  <Monitor className="w-4 h-4" />
                </Button>
                
                <Button size="sm" variant="secondary">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-card">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">Lecture Chat</p>
                <p className="text-xs text-muted-foreground">{messages.length} messages</p>
              </div>
              
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>{message.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-xs font-medium ${message.isTrainer ? 'text-primary' : ''}`}>
                            {message.user}
                            {message.isTrainer && <Badge className="ml-1 text-xs">Trainer</Badge>}
                          </span>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <p className="text-sm mt-1">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={sendMessage}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attendees" className="flex-1 flex flex-col mt-0">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">Attendees ({lectureData.attendees})</p>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {/* Trainer */}
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={lectureData.trainer.avatar} />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lectureData.trainer.name}</p>
                      <Badge className="text-xs">Trainer</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mic className="w-3 h-3 text-green-600" />
                      <Video className="w-3 h-3 text-green-600" />
                    </div>
                  </div>

                  {/* Attendees */}
                  {attendeesList.map((attendee) => (
                    <div key={attendee.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{attendee.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {attendee.handRaised && <Hand className="w-3 h-3 text-yellow-600" />}
                        {attendee.isMuted ? (
                          <MicOff className="w-3 h-3 text-red-600" />
                        ) : (
                          <Mic className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="resources" className="flex-1 flex flex-col mt-0">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">Lecture Resources</p>
              </div>
              
              <div className="p-3 space-y-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">React Hooks Slides</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Code Examples</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};