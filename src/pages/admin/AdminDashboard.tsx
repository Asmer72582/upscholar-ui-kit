import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Zap
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
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

  if (!stats) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground mb-4">
              Unable to fetch dashboard data. Please try again.
            </p>
            <Button onClick={loadDashboardData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-lg opacity-90">
                  Welcome back, {user?.firstName}. Here's your platform overview.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.users.total.toLocaleString()}</div>
            <p className={`text-xs ${stats.users.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.users.growth >= 0 ? '+' : ''}{stats.users.growth}% from last month
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.users.newThisMonth} new this month
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lectures</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.lectures.active}</div>
            <p className={`text-xs ${stats.lectures.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.lectures.growth >= 0 ? '+' : ''}{stats.lectures.growth}% from last month
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.lectures.total} total lectures
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (UC)</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Coins className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.revenue.total.toLocaleString()}</div>
            <p className={`text-xs ${stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth}% from last month
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.revenue.thisMonth} UC this month
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.users.pendingTrainers}</div>
            <p className="text-xs text-muted-foreground">
              Trainers awaiting approval
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              {pendingApprovals.length} total pending items
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User & Lecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              User Overview
            </CardTitle>
            <CardDescription>
              Platform user distribution and growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Students</span>
                </div>
                <span className="font-medium">{stats.users.students}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Approved Trainers</span>
                </div>
                <span className="font-medium">{stats.users.trainers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm">Pending Trainers</span>
                </div>
                <span className="font-medium">{stats.users.pendingTrainers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
              Lecture Overview
            </CardTitle>
            <CardDescription>
              Platform lecture status and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Scheduled</span>
                </div>
                <span className="font-medium">{stats.lectures.scheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="font-medium">{stats.lectures.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm">Total Revenue</span>
                </div>
                <span className="font-medium">{stats.revenue.total} UC</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>
                  Latest events and system updates
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-orange-100' :
                      activity.status === 'error' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>
                  Items requiring your review and approval
                </CardDescription>
              </div>
              <Badge variant="outline">
                {pendingApprovals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.item}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                    <Button size="sm" asChild>
                      <Link to={item.type === 'Trainer' ? '/admin/manage-users' : '/admin/manage-lectures'}>
                        Review
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending approvals</p>
              </div>
            )}
            {pendingApprovals.length > 5 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/manage-users">View All Pending Items</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Management Actions */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Management</CardTitle>
            <CardDescription>
              Quick access to core administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/admin/manage-users">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Manage Users</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/admin/manage-lectures">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm">Manage Lectures</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/admin/analytics">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">View Analytics</span>
                </Link>
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Monitor */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Real-time platform performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-sm font-medium">Server Status</p>
              <p className="text-xs text-success">Online</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-xs text-success">Healthy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-sm font-medium">API Response</p>
              <p className="text-xs text-success">125ms avg</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-sm font-medium">Uptime</p>
              <p className="text-xs text-success">99.9%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};