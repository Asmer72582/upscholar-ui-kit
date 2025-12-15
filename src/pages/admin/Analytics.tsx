import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, DollarSign, BookOpen, TrendingUp, Video, Calendar, Target, Award } from 'lucide-react';
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
                  <p className="text-2xl font-bold">${dashboardStats?.revenue?.total || 0}</p>
                  <p className="text-xs text-green-600">+{dashboardStats?.revenue?.growth || 0}% growth</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
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

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
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

          <TabsContent value="courses" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lecture Status Overview</CardTitle>
                  <CardDescription>Current state of all lectures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Approved</span>
                        <span className="text-sm">{lectureStats?.approved || 0}</span>
                      </div>
                      <Progress value={lectureStats?.total ? Math.round((lectureStats.approved / lectureStats.total) * 100) : 0} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Pending</span>
                        <span className="text-sm">{lectureStats?.pending || 0}</span>
                      </div>
                      <Progress value={lectureStats?.total ? Math.round((lectureStats.pending / lectureStats.total) * 100) : 0} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Completed</span>
                        <span className="text-sm">{lectureStats?.completed || 0}</span>
                      </div>
                      <Progress value={lectureStats?.total ? Math.round((lectureStats.completed / lectureStats.total) * 100) : 0} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Rejected</span>
                        <span className="text-sm">{lectureStats?.rejected || 0}</span>
                      </div>
                      <Progress value={lectureStats?.total ? Math.round((lectureStats.rejected / lectureStats.total) * 100) : 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lecture Statistics</CardTitle>
                  <CardDescription>Key metrics for lectures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{lectureStats?.total || 0}</p>
                        <p className="text-sm text-blue-800">Total Lectures</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{lectureStats?.approved || 0}</p>
                        <p className="text-sm text-green-800">Approved</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{lectureStats?.pending || 0}</p>
                        <p className="text-sm text-orange-800">Pending</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{lectureStats?.completed || 0}</p>
                        <p className="text-sm text-purple-800">Completed</p>
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
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Platform revenue statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">${dashboardStats?.totalRevenue || 0}</p>
                        <p className="text-sm text-green-800">Total Revenue</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">${dashboardStats?.monthlyRevenue || 0}</p>
                        <p className="text-sm text-blue-800">Monthly Revenue</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Revenue Growth</span>
                        <span className="text-sm">{dashboardStats?.revenueGrowth || 0}%</span>
                      </div>
                      <Progress value={dashboardStats?.revenueGrowth || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Platform engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{dashboardStats?.activeUsers || 0}</p>
                        <p className="text-sm text-purple-800">Active Users</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{dashboardStats?.newUsersThisMonth || 0}</p>
                        <p className="text-sm text-orange-800">New This Month</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">User Growth</span>
                        <span className="text-sm">{dashboardStats?.userGrowth || 0}%</span>
                      </div>
                      <Progress value={dashboardStats?.userGrowth || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{dashboardStats?.totalUsers || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{userStats?.students || 0}</p>
                      <p className="text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{userStats?.trainers || 0}</p>
                      <p className="text-muted-foreground">Trainers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{lectureStats?.total || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Lectures</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{lectureStats?.approved || 0}</p>
                      <p className="text-muted-foreground">Approved</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-orange-600">{lectureStats?.pending || 0}</p>
                      <p className="text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{dashboardStats?.activeUsers || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{dashboardStats?.userGrowth || 0}%</p>
                      <p className="text-muted-foreground">User Growth</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{dashboardStats?.revenueGrowth || 0}%</p>
                      <p className="text-muted-foreground">Revenue Growth</p>
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