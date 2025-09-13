import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Award,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { trainerService, TrainerStats } from '@/services/trainerService';

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await trainerService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount} UC`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstname}! 🎓
        </h1>
        <p className="text-lg opacity-90">
          Manage your lectures and track your teaching success
        </p>
        <div className="mt-4 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Rating: {stats.performance.averageRating}/5.0</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>{stats.performance.completionRate}% Completion Rate</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.earnings.total)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.earnings.growth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={stats.earnings.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(stats.earnings.growth)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lectures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lectures.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lectures.scheduled} scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">
                +{stats.students.newThisWeek} new this week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performance.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              ⭐ {stats.performance.totalReviews} reviews
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
            {stats.lectures.upcoming.length > 0 ? (
              stats.lectures.upcoming.map((lecture) => (
                <div key={lecture.id} className="p-4 border rounded-lg hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium">{lecture.title}</h4>
                    <Badge variant="secondary">{formatCurrency(lecture.price)}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {lecture.duration} min
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(lecture.scheduledAt)}
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
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming lectures scheduled</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to="/trainer/schedule-lecture">Schedule Your First Lecture</Link>
                </Button>
              </div>
            )}
            {stats.lectures.upcoming.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/trainer/manage-lectures">Manage All Lectures</Link>
              </Button>
            )}
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
            {stats.earnings.recentEarnings.length > 0 ? (
              stats.earnings.recentEarnings.map((earning, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{earning.lecture}</p>
                    <p className="text-sm text-muted-foreground">{earning.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">+{formatCurrency(earning.amount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No earnings yet</p>
                <p className="text-sm">Complete lectures to start earning</p>
              </div>
            )}
            {stats.earnings.recentEarnings.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/trainer/earnings">View All Earnings</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Your teaching performance overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.performance.completionRate}%</div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.performance.attendanceRate}%</div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Student Satisfaction</span>
                <span className="text-sm text-muted-foreground">{stats.performance.averageRating}/5.0</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${(stats.performance.averageRating / 5) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Overview */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              This Month
            </CardTitle>
            <CardDescription>
              Your current month performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Earnings</span>
                </div>
                <span className="font-bold text-green-500">
                  {formatCurrency(stats.earnings.thisMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Lectures</span>
                </div>
                <span className="font-bold text-blue-500">
                  {stats.lectures.scheduled}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">New Students</span>
                </div>
                <span className="font-bold text-purple-500">
                  +{stats.students.newThisWeek}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elevated">
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
              <Link to="/trainer/manage-lectures">
                <BookOpen className="w-6 h-6" />
                <span className="text-sm">Manage Lectures</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
              <Link to="/student/browse-lectures">
                <Users className="w-6 h-6" />
                <span className="text-sm">View Students</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
              <Link to="/trainer/manage-lectures">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};