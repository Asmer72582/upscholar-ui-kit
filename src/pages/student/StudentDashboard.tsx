import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Wallet,
  Users,
  PlayCircle,
  CheckCircle,
  Award,
  Target,
  Zap,
  ArrowRight,
  Plus,
  BarChart3,
  GraduationCap,
  Timer,
  Coins,
  Video,
  Trophy,
  Flame,
  BookMarked,
  Bell,
  ChevronRight,
  Radio,
} from "lucide-react";
import { lectureService, Lecture } from "@/services/lectureService";
import { walletService, WalletBalance } from "@/services/walletService";
import { toast } from "sonner";

interface DashboardStats {
  enrolledLectures: number;
  completedLectures: number;
  upcomingLectures: number;
  liveLectures: number;
  learningStreak: number;
  totalSpent: number;
  averageRating: number;
  totalHoursLearned: number;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [upcomingLectures, setUpcomingLectures] = useState<Lecture[]>([]);
  const [liveLectures, setLiveLectures] = useState<Lecture[]>([]);
  const [recentLectures, setRecentLectures] = useState<Lecture[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    enrolledLectures: 0,
    completedLectures: 0,
    upcomingLectures: 0,
    liveLectures: 0,
    learningStreak: 0,
    totalSpent: 0,
    averageRating: 0,
    totalHoursLearned: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch wallet balance
      const balance = await walletService.getBalance();
      setWalletBalance(balance);

      // Fetch user's enrolled lectures
      const myLectures = await lectureService.getMyLectures();

      // Filter lectures by status
      const now = new Date();
      const upcoming = myLectures
        .filter(
          (lecture) =>
            new Date(lecture.scheduledAt) > now &&
            lecture.status === "scheduled"
        )
        .slice(0, 4);

      const live = myLectures.filter((lecture) => lecture.status === "live");
      const completed = myLectures.filter((lecture) => lecture.status === "completed");
      const recent = completed.slice(0, 3);

      setUpcomingLectures(upcoming);
      setLiveLectures(live);
      setRecentLectures(recent);

      // Calculate stats
      const totalHours = myLectures.reduce((sum, l) => sum + (l.duration || 0), 0) / 60;
      const avgRating = completed.length > 0
        ? completed.reduce((sum, lecture) => sum + (lecture.averageRating || 0), 0) / completed.length
        : 0;

      setStats({
        enrolledLectures: myLectures.length,
        completedLectures: completed.length,
        upcomingLectures: upcoming.length,
        liveLectures: live.length,
        learningStreak: Math.floor(Math.random() * 15) + 1,
        totalSpent: balance.totalSpent || 0,
        averageRating: avgRating,
        totalHoursLearned: totalHours,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntil = (date: string) => {
    const now = new Date();
    const lectureDate = new Date(date);
    const diff = lectureDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return "Soon";
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="h-48 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl animate-pulse" />
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-2xl animate-pulse" />
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
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
                  <span className="text-white/70">Welcome back,</span>
                  {stats.learningStreak >= 7 && (
                    <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
                      <Flame className="w-3 h-3 mr-1" />
                      {stats.learningStreak} Day Streak!
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-white/80 mt-1">
                  Continue your learning journey today!
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-white/90 font-semibold"
                onClick={() => navigate('/student/browse-lectures')}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Lectures
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate('/student/wallet')}
              >
                <Coins className="w-5 h-5 mr-2" />
                {walletBalance?.balance || 0} UC
              </Button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.enrolledLectures}</p>
                  <p className="text-white/70 text-sm">Enrolled</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedLectures}</p>
                  <p className="text-white/70 text-sm">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalHoursLearned.toFixed(1)}h</p>
                  <p className="text-white/70 text-sm">Hours Learned</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.learningStreak}</p>
                  <p className="text-white/70 text-sm">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Lectures Alert */}
      {liveLectures.length > 0 && (
        <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center animate-pulse">
                    <Radio className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-red-600">🔴 LIVE NOW</h3>
                    <Badge className="bg-red-500 text-white">{liveLectures.length} Session{liveLectures.length > 1 ? 's' : ''}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {liveLectures[0].title} by {liveLectures[0].trainer?.firstname} {liveLectures[0].trainer?.lastname}
                  </p>
                </div>
              </div>
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => navigate(`/meeting/${liveLectures[0].id}`)}
              >
                <Video className="w-4 h-4 mr-2" />
                Join Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Lectures */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Upcoming Lectures
                  </CardTitle>
                  <CardDescription>Your scheduled learning sessions</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/student/my-lectures">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingLectures.length > 0 ? (
                <div className="space-y-4">
                  {upcomingLectures.map((lecture, index) => (
                    <div
                      key={lecture.id}
                      className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:border-indigo-300 hover:shadow-md cursor-pointer ${
                        index === 0 ? 'border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-gray-100'
                      }`}
                      onClick={() => navigate(`/student/lecture/${lecture.id}`)}
                    >
                      {index === 0 && (
                        <Badge className="absolute -top-2 left-4 bg-indigo-500">Next Up</Badge>
                      )}
                      <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                        <AvatarImage src={lecture.trainer?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                          {lecture.trainer?.firstname?.[0]}{lecture.trainer?.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                          {lecture.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          by {lecture.trainer?.firstname} {lecture.trainer?.lastname}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lecture.scheduledAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(lecture.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {lecture.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2 font-semibold">
                          {getTimeUntil(lecture.scheduledAt)}
                        </Badge>
                        <div>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Upcoming Lectures</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore our catalog and enroll in exciting lectures
                  </p>
                  <Button asChild>
                    <Link to="/student/browse-lectures">
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Lectures
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Completed */}
          {recentLectures.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Recently Completed
                </CardTitle>
                <CardDescription>Lectures you've finished</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentLectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="group p-4 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-100 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/student/lecture/${lecture.id}`)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={lecture.trainer?.avatar} />
                          <AvatarFallback className="bg-green-500 text-white text-sm">
                            {lecture.trainer?.firstname?.[0]}{lecture.trainer?.lastname?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{lecture.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {lecture.trainer?.firstname} {lecture.trainer?.lastname}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{(lecture.averageRating || 0).toFixed(1)}</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Wallet Card */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wallet className="w-6 h-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">UpCoins</Badge>
              </div>
              <p className="text-white/70 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-bold mb-4">{walletBalance?.balance || 0} <span className="text-lg">UC</span></p>
              <Button 
                className="w-full bg-white text-emerald-600 hover:bg-white/90 font-semibold"
                onClick={() => navigate('/student/buy-upcoins')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buy UpCoins
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Spent</span>
                <span className="font-semibold">{stats.totalSpent} UC</span>
              </div>
            </CardContent>
          </Card>

          {/* Learning Progress */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Learning Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Target</span>
                  <span className="font-medium">{stats.completedLectures}/10 lectures</span>
                </div>
                <Progress value={(stats.completedLectures / 10) * 100} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Learning Streak</span>
                  <span className="font-medium flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {stats.learningStreak} days
                  </span>
                </div>
                <Progress value={(stats.learningStreak / 30) * 100} className="h-3" />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Achievement</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {stats.completedLectures >= 10 ? '🏆 Expert Learner' : 
                     stats.completedLectures >= 5 ? '⭐ Active Learner' : 
                     '🌱 Getting Started'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start h-12">
                <Link to="/student/browse-lectures">
                  <BookOpen className="w-5 h-5 mr-3 text-indigo-500" />
                  Browse All Lectures
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-12">
                <Link to="/student/my-lectures">
                  <Calendar className="w-5 h-5 mr-3 text-green-500" />
                  My Schedule
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-12">
                <Link to="/student/wallet">
                  <Wallet className="w-5 h-5 mr-3 text-purple-500" />
                  Wallet & Transactions
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-12">
                <Link to="/student/support">
                  <Users className="w-5 h-5 mr-3 text-orange-500" />
                  Get Support
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Promo Card removed */}
        </div>
      </div>
    </div>
  );
};
