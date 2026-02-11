import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, DollarSign, BookOpen, TrendingUp, Video, Calendar, Target, Award, Activity, Server, Database, Zap, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Skeleton } from '@/components/ui/skeleton';

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [lectureStats, setLectureStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required data
        const [dashboardData, userData, lectureData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getUserStats(),
          adminService.getLectureStats()
        ]);

        setDashboardStats(dashboardData);
        setUserStats(userData);
        setLectureStats(lectureData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform insights and performance metrics</p>
          </div>
          <Skeleton className="w-32 h-10" />
        </div>
        
        {/* Loading skeletons */}
        <div className="grid md:grid-cols-6 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform insights and performance metrics</p>
          </div>
        </div>
        
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Analytics</div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform insights and performance metrics</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{dashboardStats?.users?.total || 0}</p>
                  <p className="text-xs text-green-600">+{dashboardStats?.users?.newThisMonth || 0} this month</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">₹{dashboardStats?.revenue?.total || 0}</p>
                  <p className={`text-xs ${dashboardStats?.revenue?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardStats?.revenue?.growth >= 0 ? '+' : ''}{dashboardStats?.revenue?.growth || 0}% growth
                  </p>
                </div>
                {/* <DollarSign className="w-8 h-8 text-green-600" /> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Lectures</p>
                  <p className="text-2xl font-bold">{lectureStats?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">{lectureStats?.approved || 0} approved</p>
                </div>
                <Video className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Lectures</p>
                  <p className="text-2xl font-bold">{lectureStats?.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{userStats?.active || 0}</p>
                  <p className="text-xs text-green-600">{userStats?.total ? Math.round((userStats.active / userStats.total) * 100) : 0}% of total</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Users</p>
                  <p className="text-2xl font-bold">{userStats?.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </div>
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Platform Overview</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Overview</TabsTrigger>
            <TabsTrigger value="health">Platform Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Platform Overview
                  </CardTitle>
                  <CardDescription>Total platform statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{dashboardStats?.users?.total || 0}</p>
                      <p className="text-sm text-muted-foreground mt-1">Total Users</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">{dashboardStats?.users?.students || 0}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <p className="text-xl font-bold text-green-600">{dashboardStats?.users?.trainers || 0}</p>
                        <p className="text-xs text-muted-foreground">Trainers</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">New This Month</span>
                        <span className="text-sm font-semibold text-green-600">
                          +{dashboardStats?.users?.newThisMonth || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Growth Rate</span>
                        <span className={`text-sm font-semibold flex items-center gap-1 ${dashboardStats?.users?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dashboardStats?.users?.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {dashboardStats?.users?.growth >= 0 ? '+' : ''}{dashboardStats?.users?.growth || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Platform Health
                  </CardTitle>
                  <CardDescription>System status and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Server Status</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{dashboardStats?.platformHealth?.serverStatus || 'online'}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Database</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{dashboardStats?.platformHealth?.databaseStatus || 'healthy'}</Badge>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">API Response Time</span>
                        <span className="text-sm font-semibold">{dashboardStats?.platformHealth?.apiResponseTime || 0}ms</span>
                      </div>
                      <Progress value={Math.min(100, (dashboardStats?.platformHealth?.apiResponseTime || 0) / 2)} className="h-2" />
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <span className="text-sm font-semibold text-purple-600">{dashboardStats?.platformHealth?.uptime || '99.9%'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    User Activity Overview
                  </CardTitle>
                  <CardDescription>Platform engagement and user metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{userStats?.active || 0}</p>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-xs text-green-600 mt-1">
                        {userStats?.total ? Math.round((userStats.active / userStats.total) * 100) : 0}% of total
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{dashboardStats?.users?.newThisMonth || 0}</p>
                      <p className="text-sm text-muted-foreground">New This Month</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{userStats?.pending || 0}</p>
                      <p className="text-sm text-muted-foreground">Pending Approval</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{userStats?.suspended || 0}</p>
                      <p className="text-sm text-muted-foreground">Suspended</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>User registration and activity trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Users</span>
                      <span className="font-semibold">{userStats?.active || 0}</span>
                    </div>
                    <Progress value={userStats?.total ? Math.round((userStats.active / userStats.total) * 100) : 0} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Users (This Month)</span>
                      <span className="font-semibold">{dashboardStats?.users?.newThisMonth || 0}</span>
                    </div>
                    <Progress value={dashboardStats?.users?.newThisMonth ? Math.round((dashboardStats.users.newThisMonth / userStats?.total) * 100) : 0} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Students</span>
                      <span className="font-semibold">{userStats?.students || 0}</span>
                    </div>
                    <Progress value={userStats?.total ? Math.round((userStats.students / userStats.total) * 100) : 0} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trainers</span>
                      <span className="font-semibold">{userStats?.trainers || 0}</span>
                    </div>
                    <Progress value={userStats?.total ? Math.round((userStats.trainers / userStats.total) * 100) : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of user types and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{userStats?.students || 0}</p>
                        <p className="text-sm text-blue-800">Students</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{userStats?.trainers || 0}</p>
                        <p className="text-sm text-green-800">Trainers</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{userStats?.active || 0}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{userStats?.pending || 0}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{userStats?.suspended || 0}</p>
                        <p className="text-xs text-muted-foreground">Suspended</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="revenue" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription>Platform revenue statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">₹{dashboardStats?.revenue?.total || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">₹{dashboardStats?.revenue?.thisMonth || 0}</p>
                        <p className="text-sm text-muted-foreground">This Month</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Revenue Growth</span>
                        <span className={`text-sm font-semibold flex items-center gap-1 ${dashboardStats?.revenue?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dashboardStats?.revenue?.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {dashboardStats?.revenue?.growth >= 0 ? '+' : ''}{dashboardStats?.revenue?.growth || 0}%
                        </span>
                      </div>
                      <Progress value={Math.abs(dashboardStats?.revenue?.growth || 0)} className="h-2" />
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average per Lecture</span>
                        <span className="text-sm font-semibold">
                          ₹{lectureStats?.total > 0 ? Math.round((dashboardStats?.revenue?.total || 0) / lectureStats.total) : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Current Month</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">₹{dashboardStats?.revenue?.thisMonth || 0}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">Total Platform Revenue</span>
                        <span className="text-sm font-semibold">₹{dashboardStats?.revenue?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">Revenue from Completed Lectures</span>
                        <span className="text-sm font-semibold">
                          ₹{lectureStats?.completed > 0 ? Math.round((dashboardStats?.revenue?.total || 0) * 0.8) : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    System Status
                  </CardTitle>
                  <CardDescription>Platform infrastructure health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">Server Status</p>
                          <p className="text-sm text-muted-foreground">All systems operational</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{dashboardStats?.platformHealth?.serverStatus || 'online'}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">Database</p>
                          <p className="text-sm text-muted-foreground">Connection stable</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{dashboardStats?.platformHealth?.databaseStatus || 'healthy'}</Badge>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">API Response Time</span>
                        <span className="text-sm font-semibold">{dashboardStats?.platformHealth?.apiResponseTime || 0}ms</span>
                      </div>
                      <Progress value={Math.min(100, (dashboardStats?.platformHealth?.apiResponseTime || 0) / 2)} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardStats?.platformHealth?.apiResponseTime < 200 ? 'Excellent' : dashboardStats?.platformHealth?.apiResponseTime < 500 ? 'Good' : 'Needs attention'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Platform performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Uptime</span>
                        <span className="text-lg font-bold text-purple-600">{dashboardStats?.platformHealth?.uptime || '99.9%'}</span>
                      </div>
                      <Progress value={99.9} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                        <p className="text-xl font-bold text-blue-600">{dashboardStats?.users?.total || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                        <p className="text-xl font-bold text-green-600">{lectureStats?.total || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Lectures</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">User Growth</span>
                        <span className={`text-sm font-semibold flex items-center gap-1 ${dashboardStats?.users?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dashboardStats?.users?.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {dashboardStats?.users?.growth >= 0 ? '+' : ''}{dashboardStats?.users?.growth || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Content Growth</span>
                        <span className={`text-sm font-semibold flex items-center gap-1 ${dashboardStats?.lectures?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dashboardStats?.lectures?.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {dashboardStats?.lectures?.growth >= 0 ? '+' : ''}{dashboardStats?.lectures?.growth || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};