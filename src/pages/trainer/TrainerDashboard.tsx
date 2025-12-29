import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  ThumbsUp,
  Coins,
  Video,
  Radio,
  ChevronRight,
  Wallet,
  PlayCircle,
  Timer,
  Crown,
  Sparkles,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { trainerService, TrainerStats } from '@/services/trainerService';

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeUntil = (date: string) => {
    const now = new Date();
    const lectureDate = new Date(date);
    const diff = lectureDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return "Starting soon";
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="h-56 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl animate-pulse" />
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Failed to Load Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadDashboardData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  // Check for live lectures
  const hasLiveLecture = stats.lectures.upcoming.some(l => 
    new Date(l.scheduledAt) <= new Date() && l.status !== 'completed'
  );

  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-white/20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Verified Trainer
                  </Badge>
                  {stats.performance.averageRating >= 4.5 && (
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Top Rated
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Welcome, {user?.firstName}!
                </h1>
                <p className="text-white/80 mt-1">
                  Manage your lectures and grow your teaching career
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-white/90 font-semibold"
                onClick={() => navigate('/trainer/schedule-lecture')}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Create Lecture
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate('/trainer/wallet')}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {formatCurrency(stats.earnings.total)} UC
              </Button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/30 rounded-lg">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.earnings.thisMonth)}</p>
                  <p className="text-white/70 text-sm">This Month</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/30 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.students.total}</p>
                  <p className="text-white/70 text-sm">Total Students</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/30 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.performance.averageRating.toFixed(1)}</p>
                  <p className="text-white/70 text-sm">Avg Rating</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/30 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lectures.total}</p>
                  <p className="text-white/70 text-sm">Total Lectures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approval Alert */}
      {stats.lectures.pending > 0 && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-700">Pending Approval</h3>
                  <p className="text-sm text-muted-foreground">
                    You have {stats.lectures.pending} lecture{stats.lectures.pending > 1 ? 's' : ''} waiting for admin approval
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={() => navigate('/trainer/manage-lectures')}
              >
                View Pending
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Earnings</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <Coins className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.earnings.total)} <span className="text-lg">UC</span>
            </div>
            <div className="flex items-center mt-2 text-sm">
              {stats.earnings.growth >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +{stats.earnings.growth.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  {stats.earnings.growth.toFixed(1)}%
                </span>
              )}
              <span className="text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lectures</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.lectures.scheduled}</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Completion</span>
                <span>{stats.lectures.completed}/{stats.lectures.total}</span>
              </div>
              <Progress value={(stats.lectures.completed / Math.max(stats.lectures.total, 1)) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.students.total}</div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +{stats.students.newThisWeek}
              </span>
              <span className="text-muted-foreground ml-2">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Rating</CardTitle>
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Star className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-yellow-600">{stats.performance.averageRating.toFixed(1)}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.round(stats.performance.averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on {stats.performance.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Lectures */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Upcoming Lectures
                </CardTitle>
                <CardDescription>Your scheduled teaching sessions</CardDescription>
              </div>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/trainer/schedule-lecture">
                  <PlusCircle className="w-4 h-4 mr-1" />
                  New
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.lectures.upcoming.length > 0 ? (
              <>
                {stats.lectures.upcoming.map((lecture, index) => (
                  <div 
                    key={lecture.id} 
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${
                      index === 0 ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20' : 'border-gray-100'
                    }`}
                    onClick={() => navigate(`/trainer/lectures/${lecture.id}/details`)}
                  >
                    {index === 0 && (
                      <Badge className="mb-2 bg-blue-500">Next Up</Badge>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{lecture.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(lecture.scheduledAt)}
                          </span>
                          <span className="flex items-center">
                            <Timer className="w-3 h-3 mr-1" />
                            {lecture.duration} min
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-semibold">
                        {getTimeUntil(lecture.scheduledAt)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {lecture.enrolledStudents}/{lecture.maxStudents} enrolled
                        </span>
                        <Badge variant="secondary" className="font-semibold">
                          {lecture.price} UC
                        </Badge>
                      </div>
                      <Progress 
                        value={(lecture.enrolledStudents / lecture.maxStudents) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/trainer/manage-lectures">
                    View All Lectures
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium mb-2">No Upcoming Lectures</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Create your first lecture to start teaching
                </p>
                <Button asChild>
                  <Link to="/trainer/schedule-lecture">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Lecture
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recent Earnings
            </CardTitle>
            <CardDescription>Your latest income from lectures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.earnings.recentEarnings.length > 0 ? (
              <>
                {stats.earnings.recentEarnings.map((earning, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Coins className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{earning.lecture}</p>
                        <p className="text-sm text-muted-foreground">{earning.date}</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 text-lg">
                      +{formatCurrency(earning.amount)} UC
                    </span>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/trainer/earnings">
                    View All Earnings
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium mb-2">No Earnings Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Complete lectures to start earning UpCoins
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Your teaching performance overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Completion Rate
                  </span>
                  <span className="text-sm font-bold text-green-600">{stats.performance.completionRate}%</span>
                </div>
                <Progress value={stats.performance.completionRate} className="h-3" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Attendance Rate
                  </span>
                  <span className="text-sm font-bold text-blue-600">{stats.performance.attendanceRate}%</span>
                </div>
                <Progress value={stats.performance.attendanceRate} className="h-3" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-purple-500" />
                    Student Satisfaction
                  </span>
                  <span className="text-sm font-bold text-purple-600">{((stats.performance.averageRating / 5) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(stats.performance.averageRating / 5) * 100} className="h-3" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">Teaching Level</span>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  {stats.lectures.completed >= 50 ? '🏆 Master Trainer' : 
                   stats.lectures.completed >= 20 ? '⭐ Expert Trainer' : 
                   stats.lectures.completed >= 10 ? '📚 Active Trainer' : 
                   '🌱 New Trainer'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Overview */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Student Overview
            </CardTitle>
            <CardDescription>Your student engagement stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-muted-foreground">Total Students</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{stats.students.total}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-muted-foreground">Active Students</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.students.active}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-muted-foreground">New This Week</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">+{stats.students.newThisWeek}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-100">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-muted-foreground">Reviews</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats.performance.totalReviews}</p>
              </div>
            </div>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/trainer/students">
                View All Students
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Manage your teaching activities efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-blue-300 hover:bg-blue-50">
              <Link to="/trainer/schedule-lecture">
                <PlusCircle className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium">Create Lecture</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-purple-300 hover:bg-purple-50">
              <Link to="/trainer/manage-lectures">
                <BookOpen className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium">Manage Lectures</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-indigo-300 hover:bg-indigo-50">
              <Link to="/trainer/students">
                <Users className="w-8 h-8 text-indigo-600" />
                <span className="text-sm font-medium">View Students</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-green-300 hover:bg-green-50">
              <Link to="/trainer/wallet">
                <Wallet className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium">Wallet & Earnings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
