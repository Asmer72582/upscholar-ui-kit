import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  PlayCircle, 
  CheckCircle,
  XCircle,
  Star,
  BookOpen,
  Video,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const myLectures = [
  {
    id: 'lecture-1',
    title: 'Introduction to React Hooks',
    trainer: 'Jane Smith',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    scheduledAt: '2024-01-15T14:00:00Z',
    duration: 90,
    price: 50,
    status: 'upcoming',
    enrolledAt: '2024-01-10T10:00:00Z',
    category: 'Programming',
    progress: 0,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-2',
    title: 'Advanced TypeScript Patterns',
    trainer: 'Mike Johnson',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    scheduledAt: '2024-01-16T16:00:00Z',
    duration: 120,
    price: 75,
    status: 'upcoming',
    enrolledAt: '2024-01-12T15:30:00Z',
    category: 'Programming',
    progress: 0,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-3',
    title: 'JavaScript Fundamentals',
    trainer: 'Alex Turner',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    scheduledAt: '2024-01-10T10:00:00Z',
    duration: 90,
    price: 45,
    status: 'completed',
    enrolledAt: '2024-01-05T09:00:00Z',
    category: 'Programming',
    progress: 100,
    rating: 5,
    completedAt: '2024-01-10T11:30:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-4',
    title: 'CSS Grid Mastery',
    trainer: 'Lisa Chen',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    scheduledAt: '2024-01-08T14:00:00Z',
    duration: 75,
    price: 40,
    status: 'completed',
    enrolledAt: '2024-01-03T12:00:00Z',
    category: 'Web Design',
    progress: 100,
    rating: 4,
    completedAt: '2024-01-08T15:15:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-5',
    title: 'React Performance Optimization',
    trainer: 'David Kumar',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    scheduledAt: '2024-01-05T16:00:00Z',
    duration: 105,
    price: 65,
    status: 'missed',
    enrolledAt: '2024-01-01T10:00:00Z',
    category: 'Programming',
    progress: 0,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
  },
];

export const MyLectures: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'missed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <BookOpen className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'text-primary bg-primary/10';
      case 'completed':
        return 'text-success bg-success/10';
      case 'missed':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const filteredLectures = myLectures.filter(lecture => {
    if (selectedTab === 'all') return true;
    return lecture.status === selectedTab;
  });

  const upcomingCount = myLectures.filter(l => l.status === 'upcoming').length;
  const completedCount = myLectures.filter(l => l.status === 'completed').length;
  const missedCount = myLectures.filter(l => l.status === 'missed').length;

  const LectureCard = ({ lecture }: { lecture: any }) => (
    <Card className="card-elevated">
      <div className="relative">
        <img 
          src={lecture.thumbnail} 
          alt={lecture.title}
          className="w-full h-48 object-cover rounded-t-2xl"
        />
        <div className="absolute top-3 left-3">
          <Badge className={cn("text-xs", getStatusColor(lecture.status))}>
            {getStatusIcon(lecture.status)}
            <span className="ml-1 capitalize">{lecture.status}</span>
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-xs">
            {lecture.category}
          </Badge>
        </div>
        {lecture.status === 'completed' && lecture.progress === 100 && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-success/90 backdrop-blur-sm rounded-full p-2">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-2">{lecture.title}</CardTitle>
        <CardDescription>
          by {lecture.trainer}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(lecture.scheduledAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {lecture.duration} min
            </div>
          </div>

          {lecture.status === 'completed' && lecture.rating && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Rating:</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-4 h-4",
                      i < lecture.rating 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted-foreground"
                    )} 
                  />
                ))}
              </div>
            </div>
          )}

          {lecture.progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{lecture.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${lecture.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {lecture.status === 'upcoming' && (
              <>
                <Button size="sm" className="flex-1 btn-primary">
                  <PlayCircle className="w-4 h-4 mr-1" />
                  Join Lecture
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {lecture.status === 'completed' && (
              <>
                <Button size="sm" variant="outline" className="flex-1">
                  <Video className="w-4 h-4 mr-1" />
                  Watch Recording
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {lecture.status === 'missed' && (
              <Button size="sm" variant="outline" className="flex-1">
                <Video className="w-4 h-4 mr-1" />
                View Recording
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Lectures</h1>
        <p className="text-muted-foreground">
          Manage and track your enrolled lectures and learning progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myLectures.length}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{upcomingCount}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedCount}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((completedCount / myLectures.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lectures Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({myLectures.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
          <TabsTrigger value="missed">Missed ({missedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredLectures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          ) : (
            <Card className="card-elevated">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No {selectedTab === 'all' ? '' : selectedTab} lectures found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedTab === 'upcoming' 
                    ? "You don't have any upcoming lectures scheduled."
                    : selectedTab === 'completed'
                    ? "You haven't completed any lectures yet."
                    : selectedTab === 'missed'
                    ? "You haven't missed any lectures."
                    : "You haven't enrolled in any lectures yet."
                  }
                </p>
                <Button variant="outline">
                  Browse Lectures
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};