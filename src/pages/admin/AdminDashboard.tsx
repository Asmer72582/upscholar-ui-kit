import React from 'react';
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
  Settings,
  BarChart3,
  MessageSquare,
  Shield
} from 'lucide-react';

const platformStats = [
  { label: 'Total Users', value: '2,847', change: '+12%', icon: Users },
  { label: 'Active Lectures', value: '156', change: '+8%', icon: BookOpen },
  { label: 'Revenue (UC)', value: '45,230', change: '+15%', icon: DollarSign },
  { label: 'Growth Rate', value: '23%', change: '+5%', icon: TrendingUp },
];

const recentActivity = [
  {
    id: 1,
    type: 'user',
    message: '15 new users registered today',
    time: '2 hours ago',
    icon: Users,
    status: 'info',
  },
  {
    id: 2,
    type: 'lecture',
    message: 'React Hooks lecture needs approval',
    time: '4 hours ago',
    icon: AlertTriangle,
    status: 'warning',
  },
  {
    id: 3,
    type: 'payment',
    message: 'Payment gateway issue resolved',
    time: '6 hours ago',
    icon: CheckCircle,
    status: 'success',
  },
  {
    id: 4,
    type: 'support',
    message: '3 new support tickets submitted',
    time: '8 hours ago',
    icon: MessageSquare,
    status: 'info',
  },
];

const pendingApprovals = [
  { id: 1, type: 'Trainer', name: 'Sarah Wilson', item: 'Profile verification' },
  { id: 2, type: 'Lecture', name: 'Advanced JavaScript', item: 'Content review' },
  { id: 3, type: 'Course', name: 'Full Stack Development', item: 'Curriculum approval' },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-2xl p-8 text-white">
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
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {platformStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-success">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>
              Latest events and system updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'success' ? 'bg-success/10' :
                    activity.status === 'warning' ? 'bg-warning/10' :
                    'bg-primary/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              Items requiring your review and approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.item}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <Button size="sm" className="btn-primary">
                    Review
                  </Button>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/approvals">View All Pending Items</Link>
            </Button>
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
              <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover-scale">
                <Link to="/admin/support">
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm">Support Center</span>
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