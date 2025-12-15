import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Loader2,
  TrendingDown,
  Eye,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Bell,
  Zap,
  ThumbsUp
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
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount) + ' UC';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="h-3 w-3" />;
    if (growth < 0) return <ArrowDownRight className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
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
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 🎓
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Manage your lectures and track your teaching success
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span className="font-semibold">{stats.performance.averageRating.toFixed(1)}/5.0</span>
                <span className="opacity-75">({stats.performance.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span className="font-semibold">{stats.performance.completionRate}%</span>
                <span className="opacity-75">Completion</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{formatNumber(stats.students.total)}</span>
                <span className="opacity-75">Students</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Button asChild variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Link to="/trainer/schedule-lecture">
                <PlusCircle className="w-5 h-5 mr-2" />
                Schedule Lecture
              </Link>
            </Button>
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
            <div className="flex items-center text-xs mt-1">
              <span className={getGrowthColor(stats.earnings.growth)}>
                {getGrowthIcon(stats.earnings.growth)}
              </span>
              <span className={`${getGrowthColor(stats.earnings.growth)} ml-1 font-medium`}>
                {stats.earnings.growth > 0 ? '+' : ''}{stats.earnings.growth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month: {formatCurrency(stats.earnings.thisMonth)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lectures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lectures.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lectures.scheduled} scheduled · {stats.lectures.completed} completed
            </p>
            <div className="mt-2">
              <Progress value={(stats.lectures.completed / stats.lectures.total) * 100} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.students.total)}</div>
            <div className="flex items-center text-xs mt-1">
              <span className={getGrowthColor(stats.students.growth)}>
                {getGrowthIcon(stats.students.growth)}
              </span>
              <span className={`${getGrowthColor(stats.students.growth)} ml-1 font-medium`}>
                +{stats.students.newThisWeek} this week
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.students.active} active students
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats.performance.averageRating.toFixed(1)}
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 ml-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {stats.performance.totalReviews} reviews
            </p>
            <div className="mt-2">
              <Progress value={(stats.performance.averageRating / 5) * 100} className="h-1" />
            </div>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {lecture.enrolledStudents}/{lecture.maxStudents} enrolled
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((lecture.enrolledStudents / lecture.maxStudents) * 100)}% full
                      </span>
                    </div>
                    <Progress value={(lecture.enrolledStudents / lecture.maxStudents) * 100} className="h-2" />
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
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Completion Rate
                  </span>
                  <span className="text-sm font-bold text-green-500">{stats.performance.completionRate}%</span>
                </div>
                <Progress value={stats.performance.completionRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    Attendance Rate
                  </span>
                  <span className="text-sm font-bold text-blue-500">{stats.performance.attendanceRate}%</span>
                </div>
                <Progress value={stats.performance.attendanceRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    <ThumbsUp className="w-4 h-4 mr-2 text-purple-500" />
                    Student Satisfaction
                  </span>
                  <span className="text-sm font-bold text-purple-500">{stats.performance.averageRating.toFixed(1)}/5.0</span>
                </div>
                <Progress value={(stats.performance.averageRating / 5) * 100} className="h-2" />
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
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">This Month Earnings</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(stats.earnings.thisMonth)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Scheduled Lectures</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">
                      {stats.lectures.scheduled} lectures
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">New This Week</p>
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      +{stats.students.newThisWeek} students
                    </p>
                  </div>
                </div>
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
                <span className="text-sm">List Lecture</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
              <Link to="/trainer/manage-lectures">
                <BookOpen className="w-6 h-6" />
                <span className="text-sm">Manage Lectures</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
              <Link to="/trainer/students">
                <Users className="w-6 h-6" />
                <span className="text-sm">View Students</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
              <Link to="/trainer/wallet">
                <DollarSign className="w-6 h-6" />
                <span className="text-sm">Wallet & Earnings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};