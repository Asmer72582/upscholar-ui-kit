import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp, 
  Wallet,
  Users,
  PlayCircle,
  CheckCircle
} from 'lucide-react';

const upcomingLectures = [
  {
    id: 'lecture-1',
    title: 'Introduction to React Hooks',
    trainer: 'Jane Smith',
    scheduledAt: '2024-01-15T14:00:00Z',
    duration: 90,
    price: 50,
  },
  {
    id: 'lecture-2',
    title: 'Advanced TypeScript Patterns',
    trainer: 'Mike Johnson',
    scheduledAt: '2024-01-16T16:00:00Z',
    duration: 120,
    price: 75,
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'enrollment',
    title: 'Enrolled in React Hooks lecture',
    time: '2 hours ago',
    icon: BookOpen,
  },
  {
    id: 2,
    type: 'payment',
    title: 'Added 100 Upcoins to wallet',
    time: '1 day ago',
    icon: Wallet,
  },
  {
    id: 3,
    type: 'completion',
    title: 'Completed JavaScript Fundamentals',
    time: '3 days ago',
    icon: CheckCircle,
  },
];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-lg opacity-90">
          Continue your learning journey with personalized recommendations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">250 UC</div>
            <p className="text-xs text-muted-foreground">
              +20 from last week
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Lectures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              2 upcoming this week
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 this month
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up! 🔥
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Lectures */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Upcoming Lectures
            </CardTitle>
            <CardDescription>
              Your scheduled learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingLectures.map((lecture) => (
              <div key={lecture.id} className="flex items-center justify-between p-4 border rounded-lg hover-lift">
                <div className="flex-1">
                  <h4 className="font-medium">{lecture.title}</h4>
                  <p className="text-sm text-muted-foreground">by {lecture.trainer}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {lecture.duration} min
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Jan 15, 2:00 PM
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-2">
                    {lecture.price} UC
                  </Badge>
                  <Button size="sm" className="btn-primary">
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Join
                  </Button>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/my-lectures">View All Lectures</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest learning activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Popular actions to enhance your learning experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/student/browse-lectures">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm">Browse Lectures</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/student/wallet">
                  <Wallet className="w-6 h-6" />
                  <span className="text-sm">Add Upcoins</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/student/my-lectures">
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">My Schedule</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/student/support">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Get Support</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};