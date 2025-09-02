import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  PlusCircle,
  Clock,
  Star,
  BarChart3
} from 'lucide-react';

const upcomingLectures = [
  {
    id: 'lecture-1',
    title: 'Introduction to React Hooks',
    scheduledAt: '2024-01-15T14:00:00Z',
    duration: 90,
    enrolledStudents: 18,
    maxStudents: 25,
    price: 50,
  },
  {
    id: 'lecture-2',
    title: 'Advanced TypeScript Patterns',
    scheduledAt: '2024-01-16T16:00:00Z',
    duration: 120,
    enrolledStudents: 15,
    maxStudents: 20,
    price: 75,
  },
];

const recentEarnings = [
  { date: '2024-01-10', amount: 150, lecture: 'JavaScript Fundamentals' },
  { date: '2024-01-08', amount: 200, lecture: 'React Basics Workshop' },
  { date: '2024-01-05', amount: 100, lecture: 'CSS Grid Mastery' },
];

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-accent rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 🎓
        </h1>
        <p className="text-lg opacity-90">
          Manage your lectures and track your teaching success
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,450 UC</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lectures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 scheduled this week
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +8 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              ⭐ Excellent rating
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Lectures */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Upcoming Lectures
                </CardTitle>
                <CardDescription>
                  Your scheduled teaching sessions
                </CardDescription>
              </div>
              <Button asChild size="sm" className="btn-primary">
                <Link to="/trainer/schedule-lecture">
                  <PlusCircle className="w-4 h-4 mr-1" />
                  New
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingLectures.map((lecture) => (
              <div key={lecture.id} className="p-4 border rounded-lg hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{lecture.title}</h4>
                  <Badge variant="secondary">{lecture.price} UC</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {lecture.duration} min
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Jan 15, 2:00 PM
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {lecture.enrolledStudents}/{lecture.maxStudents} enrolled
                    </span>
                  </div>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(lecture.enrolledStudents / lecture.maxStudents) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/trainer/manage-lectures">Manage All Lectures</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Recent Earnings
            </CardTitle>
            <CardDescription>
              Your latest income from lectures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEarnings.map((earning, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{earning.lecture}</p>
                  <p className="text-sm text-muted-foreground">{earning.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">+{earning.amount} UC</p>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/trainer/earnings">View All Earnings</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your teaching activities efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/trainer/schedule-lecture">
                  <PlusCircle className="w-6 h-6" />
                  <span className="text-sm">Schedule Lecture</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/trainer/create-course">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm">Create Course</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/trainer/students">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">My Students</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/trainer/earnings">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};