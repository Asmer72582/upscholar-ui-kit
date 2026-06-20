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
  Sparkles,
  Receipt,
  Percent,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
    missed?: number;
    live?: number;
    cancelled?: number;
    active: number;
    completed: number;
    scheduled: number;
    pending?: number;
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

interface CommissionTransaction {
  date: string;
  amount: number;
  source: 'lecture' | 'bidding';
  description: string;
  reference: string;
  transactionId?: string;
  ticketId?: string;
}

interface CommissionData {
  total: number;
  fromLectures: number;
  fromBidding: number;
  thisMonth: number;
  thisMonthFromLectures: number;
  thisMonthFromBidding: number;
  totalRevenue: number;
  totalTrainerEarnings: number;
  transactionCount: number;
  transactions: CommissionTransaction[];
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [commission, setCommission] = useState<CommissionData | null>(null);
  const [commissionTableOpen, setCommissionTableOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResult, activityResult, approvalsResult, commissionResult] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(),
        adminService.getPendingApprovals(),
        adminService.getCommission()
      ]);

      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      else if (statsResult.status === 'rejected') throw statsResult.reason;
      if (activityResult.status === 'fulfilled') setRecentActivity(activityResult.value);
      if (approvalsResult.status === 'fulfilled') setPendingApprovals(approvalsResult.value);
      if (commissionResult.status === 'fulfilled') setCommission(commissionResult.value);
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
      case 'payment': return Coins;
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
        <div className="h-48 bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
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
                  <p className="text-2xl font-bold">{stats.lectures.total + (stats.lectures.missed ?? 0)}</p>
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
                  <p className="text-2xl font-bold">{stats.revenue.total.toLocaleString()} UC</p>
                  <p className="text-white/70 text-sm">Total Revenue</p>
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

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.users.newThisMonth} this month
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Lectures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lectures.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lectures.scheduled} scheduled
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.thisMonth.toLocaleString()} UC</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.revenue.growth}% vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground mt-1">
              99.9% uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Income Section */}
      {commission && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-amber-800">
                  <Receipt className="w-5 h-5" />
                  Commission Income
                </CardTitle>
                <CardDescription>Administrative earnings from platform transactions</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-700">
                  {(commission.thisMonth ?? 0).toLocaleString()} UC
                </p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Collapsible open={commissionTableOpen} onOpenChange={setCommissionTableOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full px-6 py-3 border-b bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <span className="font-medium flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Transaction Details
                  </span>
                  {commissionTableOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Source</th>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-right p-3 font-medium">Amount (UC)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commission.transactions.slice(0, 10).map((tx, i) => (
                        <tr key={tx.reference + i} className="border-b hover:bg-muted/10">
                          <td className="p-3 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                          <td className="p-3 capitalize">{tx.source}</td>
                          <td className="p-3">{tx.description}</td>
                          <td className="p-3 text-right font-medium text-green-600">+{tx.amount.toLocaleString()} UC</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-blue-600" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-blue-50">
                <p className="text-2xl font-bold text-blue-600">{stats.users.students}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50">
                <p className="text-2xl font-bold text-green-600">{stats.users.trainers}</p>
                <p className="text-sm text-muted-foreground">Trainers</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-orange-50">
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
                <Progress value={(stats.users.students / stats.users.total) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Trainers</span>
                  <span className="font-medium">{((stats.users.trainers / stats.users.total) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.users.trainers / stats.users.total) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-5 h-5 text-indigo-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getStatusColor(activity.status);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-green-600" />
              Server Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Main API</span>
              </div>
              <Badge className="bg-green-500">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Response</span>
              </div>
              <span className="text-sm font-bold">125ms</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/admin/manage-users">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span>Users</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/admin/manage-lectures">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <span>Lectures</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/admin/analytics">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <span>Analytics</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/admin/settings">
                  <Settings className="w-6 h-6 text-slate-600" />
                  <span>Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
