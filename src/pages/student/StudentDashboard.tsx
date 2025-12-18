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
} from "lucide-react";
import { lectureService, Lecture } from "@/services/lectureService";
import { walletService, WalletBalance } from "@/services/walletService";
import { toast } from "sonner";

interface DashboardStats {
  enrolledLectures: number;
  completedLectures: number;
  upcomingLectures: number;
  learningStreak: number;
  totalSpent: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: "enrollment" | "completion" | "payment" | "achievement";
  title: string;
  description?: string;
  time: string;
  icon: any;
  color: string;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(
    null
  );
  const [upcomingLectures, setUpcomingLectures] = useState<Lecture[]>([]);
  const [recentLectures, setRecentLectures] = useState<Lecture[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    enrolledLectures: 0,
    completedLectures: 0,
    upcomingLectures: 0,
    learningStreak: 0,
    totalSpent: 0,
    averageRating: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

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

      // Filter upcoming and completed lectures
      const now = new Date();
      const upcoming = myLectures
        .filter(
          (lecture) =>
            new Date(lecture.scheduledAt) > now &&
            lecture.status === "scheduled"
        )
        .slice(0, 3);

      const completed = myLectures.filter(
        (lecture) => lecture.status === "completed"
      );

      const recent = myLectures
        .filter((lecture) => lecture.status === "completed")
        .slice(0, 3);

      setUpcomingLectures(upcoming);
      setRecentLectures(recent);

      // Calculate stats
      const enrolledCount = myLectures.length;
      const completedCount = completed.length;
      const avgRating =
        completed.length > 0
          ? completed.reduce((sum, lecture) => sum + lecture.averageRating, 0) /
            completed.length
          : 0;

      setStats({
        enrolledLectures: enrolledCount,
        completedLectures: completedCount,
        upcomingLectures: upcoming.length,
        learningStreak: Math.floor(Math.random() * 15) + 1, // Mock streak
        totalSpent: balance.totalSpent,
        averageRating: avgRating,
      });

      // Generate recent activity
      const activities: RecentActivity[] = [];

      // Add recent enrollments
      myLectures.slice(0, 2).forEach((lecture, index) => {
        activities.push({
          id: `enrollment-${lecture.id}`,
          type: "enrollment",
          title: `Enrolled in ${lecture.title}`,
          description: `by ${lecture.trainer.firstname} ${lecture.trainer.lastname}`,
          time: `${index + 1} day${index > 0 ? "s" : ""} ago`,
          icon: BookOpen,
          color: "text-blue-600",
        });
      });

      // Add recent completions
      completed.slice(0, 1).forEach((lecture, index) => {
        activities.push({
          id: `completion-${lecture.id}`,
          type: "completion",
          title: `Completed ${lecture.title}`,
          description: `Earned certificate`,
          time: `${index + 3} days ago`,
          icon: CheckCircle,
          color: "text-green-600",
        });
      });

      // Add wallet activity
      if (balance.totalEarned > 0) {
        activities.push({
          id: "wallet-activity",
          type: "payment",
          title: "Added funds to wallet",
          description: `${balance.totalEarned} UC total earned`,
          time: "2 days ago",
          icon: Wallet,
          color: "text-purple-600",
        });
      }

      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-32 bg-muted rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName} {user?.lastName}! 👋
              </h1>
              <p className="text-lg opacity-90 mb-4">
                Continue your learning journey with personalized recommendations
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>{stats.completedLectures} lectures completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>{stats.learningStreak} day streak</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className="card-elevated hover-lift cursor-pointer"
          onClick={() => navigate("/student/wallet")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Coins className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {walletBalance?.balance || 0} UC
            </div>
            <p className="text-xs text-muted-foreground">
              {walletBalance?.totalSpent || 0} UC spent total
            </p>
          </CardContent>
        </Card>

        <Card
          className="card-elevated hover-lift cursor-pointer"
          onClick={() => navigate("/student/my-lectures")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Lectures
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.enrolledLectures}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingLectures} upcoming this week
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.completedLectures}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.averageRating.toFixed(1)} ⭐ average rating
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Learning Streak
            </CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.learningStreak} days
            </div>
            <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Lectures */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Upcoming Lectures
                </CardTitle>
                <CardDescription>
                  Your scheduled learning sessions
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/student/my-lectures">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingLectures.length > 0 ? (
              upcomingLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-lift cursor-pointer"
                  onClick={() => navigate(`/student/lecture/${lecture.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={lecture.trainer.avatar} />
                      <AvatarFallback>
                        {lecture.trainer.firstname[0]}
                        {lecture.trainer.lastname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{lecture.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {lecture.trainer.firstname}{" "}
                        {lecture.trainer.lastname}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {lecture.duration} min
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(lecture.scheduledAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Timer className="w-3 h-3 mr-1" />
                          {new Date(lecture.scheduledAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">
                      {lecture.price} UC
                    </Badge>
                    <div>
                      <Button size="sm" className="btn-primary">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No upcoming lectures
                </h3>
                <p className="text-muted-foreground mb-4">
                  Browse and enroll in lectures to see them here
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

        {/* Learning Progress & Recent Activity */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Goal</span>
                  <span>{stats.completedLectures}/10</span>
                </div>
                <Progress
                  value={(stats.completedLectures / 10) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Learning Streak</span>
                  <span>{stats.learningStreak} days</span>
                </div>
                <Progress
                  value={Math.min((stats.learningStreak / 30) * 100, 100)}
                  className="h-2"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Achievement</span>
                  </div>
                  <Badge variant="outline">
                    {stats.completedLectures > 5
                      ? "Active Learner"
                      : "Getting Started"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center`}
                      >
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No recent activity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Completed Lectures */}
      {recentLectures.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Recently Completed
                </CardTitle>
                <CardDescription>
                  Lectures you've finished recently
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/student/my-lectures">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="p-4 border rounded-lg hover-lift cursor-pointer"
                  onClick={() => navigate(`/student/lecture/${lecture.id}`)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={lecture.trainer.avatar} />
                      <AvatarFallback>
                        {lecture.trainer.firstname[0]}
                        {lecture.trainer.lastname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{lecture.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {lecture.trainer.firstname} {lecture.trainer.lastname}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">
                        {lecture.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Popular actions to enhance your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col space-y-2 hover-scale"
            >
              <Link to="/student/browse-lectures">
                <BookOpen className="w-6 h-6" />
                <span className="text-sm">Browse Lectures</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col space-y-2 hover-scale"
            >
              <Link to="/student/wallet">
                <Wallet className="w-6 h-6" />
                <span className="text-sm">Manage Wallet</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col space-y-2 hover-scale"
            >
              <Link to="/student/my-lectures">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">My Schedule</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col space-y-2 hover-scale"
            >
              <Link to="/student/support">
                <Users className="w-6 h-6" />
                <span className="text-sm">Get Support</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
