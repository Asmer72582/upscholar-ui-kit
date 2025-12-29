import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  MessageSquare,
  Shield,
  RefreshCw,
  UserCheck,
  GraduationCap,
  Coins,
  Activity,
  Clock,
  Server,
  Database,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Eye,
  UserX,
  Calendar,
  Crown,
  Star,
  Bell,
  Settings,
  FileText,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

interface DashboardStats {
  users: {
    total: number;
    students: number;
    trainers: number;
    pendingTrainers: number;
    growth: number;
    newThisMonth: number;
  };
  lectures: {
    total: number;
    active: number;
    completed: number;
    scheduled: number;
    pending: number;
    growth: number;
    newThisMonth: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
  };
  platformHealth: {
    serverStatus: string;
    databaseStatus: string;
    apiResponseTime: number;
    uptime: string;
  };
}

interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
  status: string;
  data?: any;
}

interface PendingApproval {
  id: string;
  type: string;
  name: string;
  item: string;
  email?: string;
  trainer?: string;
  createdAt: string;
  data: any;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData, approvalsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(),
        adminService.getPendingApprovals()
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
      setPendingApprovals(approvalsData);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
      toast.success('Dashboard data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'lecture': return BookOpen;
      case 'approval': return AlertTriangle;
      case 'payment': return DollarSign;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="h-48 bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-3xl animate-pulse" />
        
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Failed to Load Dashboard</h3>
            <p className="text-muted-foreground mb-4">Unable to fetch dashboard data</p>
            <Button onClick={loadDashboardData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPendingApprovals = stats.users.pendingTrainers + (stats.lectures.pending || 0);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-gray-800 to-zinc-900 p-8 text-white">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <Badge className="mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Administrator
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Welcome, {user?.firstName}!
                </h1>
                <p className="text-white/70 mt-1">
                  Monitor and manage the entire Upscholar platform
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold"
                onClick={() => navigate('/admin/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/30 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.users.total.toLocaleString()}</p>
                  <p className="text-white/70 text-sm">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/30 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lectures.total}</p>
                  <p className="text-white/70 text-sm">Total Lectures</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/30 rounded-lg">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.revenue.total.toLocaleString()}</p>
                  <p className="text-white/70 text-sm">Total Revenue (UC)</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${totalPendingApprovals > 0 ? 'bg-orange-500/30' : 'bg-green-500/30'}`}>
                  {totalPendingApprovals > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPendingApprovals}</p>
                  <p className="text-white/70 text-sm">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for Pending Approvals */}
      {totalPendingApprovals > 0 && (
        <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center animate-pulse">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-orange-700">Action Required</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.users.pendingTrainers} trainer applications & {stats.lectures.pending || 0} lectures awaiting approval
                  </p>
                </div>
              </div>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => navigate('/admin/manage-users')}
              >
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.users.total.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm">
              {stats.users.growth >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +{stats.users.growth}%
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  {stats.users.growth}%
                </span>
              )}
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.users.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Lectures</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.lectures.active}</div>
            <div className="flex items-center mt-2 text-sm">
              {stats.lectures.growth >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +{stats.lectures.growth}%
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  {stats.lectures.growth}%
                </span>
              )}
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lectures.total} total lectures
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Revenue (UC)</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Coins className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.revenue.total.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm">
              {stats.revenue.growth >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +{stats.revenue.growth}%
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  {stats.revenue.growth}%
                </span>
              )}
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.revenue.thisMonth.toLocaleString()} UC this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Pending</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalPendingApprovals}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>{stats.users.pendingTrainers} trainers</p>
              <p>{stats.lectures.pending || 0} lectures</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-blue-600" />
              User Distribution
            </CardTitle>
            <CardDescription>Platform user breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{stats.users.students}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950/30">
                <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.users.trainers}</p>
                <p className="text-sm text-muted-foreground">Trainers</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{stats.users.pendingTrainers}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Students</span>
                  <span className="font-medium">{((stats.users.students / stats.users.total) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.users.students / stats.users.total) * 100} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Trainers</span>
                  <span className="font-medium">{((stats.users.trainers / stats.users.total) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.users.trainers / stats.users.total) * 100} className="h-3" />
              </div>
            </div>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/manage-users">
                Manage Users <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Lecture Overview */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="w-5 h-5 text-green-600" />
              Lecture Overview
            </CardTitle>
            <CardDescription>Platform lecture status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats.lectures.pending || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.lectures.scheduled}</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-muted-foreground">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.lectures.completed}</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Revenue</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.revenue.total.toLocaleString()} UC</p>
              </div>
            </div>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/manage-lectures">
                Manage Lectures <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>Items requiring your review</CardDescription>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                {pendingApprovals.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.length > 0 ? (
              <>
                {pendingApprovals.slice(0, 4).map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 rounded-xl border hover:border-orange-200 hover:bg-orange-50/50 transition-all cursor-pointer"
                    onClick={() => navigate(item.type === 'Trainer' ? '/admin/manage-users' : '/admin/manage-lectures')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.type === 'Trainer' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {item.type === 'Trainer' ? (
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.item}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">{item.type}</Badge>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/admin/manage-users">
                    View All Pending <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground text-sm">
                  No pending approvals at this time
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getStatusColor(activity.status);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card className="border-0 shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Server Status</span>
              </div>
              <Badge className="bg-green-500">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge className="bg-green-500">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">API Response</span>
              </div>
              <Badge variant="outline">~125ms</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <Badge variant="outline">99.9%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Platform Management</CardTitle>
            <CardDescription>Quick access to administrative functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-blue-300 hover:bg-blue-50">
                <Link to="/admin/manage-users">
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium">Manage Users</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-green-300 hover:bg-green-50">
                <Link to="/admin/manage-lectures">
                  <BookOpen className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-medium">Manage Lectures</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-purple-300 hover:bg-purple-50">
                <Link to="/admin/analytics">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <span className="text-sm font-medium">Analytics</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-orange-300 hover:bg-orange-50">
                <Link to="/admin/support">
                  <MessageSquare className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium">Support</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
