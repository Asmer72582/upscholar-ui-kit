import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, DollarSign, BookOpen, TrendingUp, Video, Calendar, Target, Award } from 'lucide-react';

const analyticsData = {
  overview: {
    totalUsers: 1250,
    totalRevenue: 45800,
    totalCourses: 89,
    totalLectures: 324,
    growthRate: 12.5,
    conversionRate: 8.2
  },
  userMetrics: {
    newUsers: 156,
    activeUsers: 892,
    retentionRate: 78,
    avgSessionTime: 45
  },
  courseMetrics: {
    topCourses: [
      { name: 'Complete React Masterclass', enrollments: 456, revenue: 12500 },
      { name: 'UI/UX Design Fundamentals', enrollments: 324, revenue: 8900 },
      { name: 'Advanced TypeScript', enrollments: 289, revenue: 7200 }
    ],
    categoryDistribution: [
      { category: 'Programming', percentage: 45 },
      { category: 'Design', percentage: 25 },
      { category: 'Business', percentage: 20 },
      { category: 'Marketing', percentage: 10 }
    ]
  },
  revenueMetrics: {
    monthlyRevenue: [
      { month: 'Jan', revenue: 3200 },
      { month: 'Feb', revenue: 4100 },
      { month: 'Mar', revenue: 3800 },
      { month: 'Apr', revenue: 5200 },
      { month: 'May', revenue: 4900 },
      { month: 'Jun', revenue: 5800 }
    ],
    revenueBySource: [
      { source: 'Course Sales', amount: 28500, percentage: 62 },
      { source: 'Lecture Fees', amount: 12800, percentage: 28 },
      { source: 'Subscriptions', amount: 4500, percentage: 10 }
    ]
  }
};

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

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
                  <p className="text-2xl font-bold">{analyticsData.overview.totalUsers}</p>
                  <p className="text-xs text-green-600">+{analyticsData.userMetrics.newUsers} this month</p>
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
                  <p className="text-2xl font-bold">${analyticsData.overview.totalRevenue}</p>
                  <p className="text-xs text-green-600">+{analyticsData.overview.growthRate}% growth</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{analyticsData.overview.totalCourses}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Live Lectures</p>
                  <p className="text-2xl font-bold">{analyticsData.overview.totalLectures}</p>
                  <p className="text-xs text-muted-foreground">Total conducted</p>
                </div>
                <Video className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</p>
                  <p className="text-xs text-green-600">+2.1% improvement</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Retention Rate</p>
                  <p className="text-2xl font-bold">{analyticsData.userMetrics.retentionRate}%</p>
                  <p className="text-xs text-muted-foreground">30-day retention</p>
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
                      <span className="font-semibold">{analyticsData.userMetrics.activeUsers}</span>
                    </div>
                    <Progress value={71} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Users (This Month)</span>
                      <span className="font-semibold">{analyticsData.userMetrics.newUsers}</span>
                    </div>
                    <Progress value={62} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Retention Rate</span>
                      <span className="font-semibold">{analyticsData.userMetrics.retentionRate}%</span>
                    </div>
                    <Progress value={analyticsData.userMetrics.retentionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                  <CardDescription>How users interact with the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{analyticsData.userMetrics.avgSessionTime}min</p>
                      <p className="text-sm text-muted-foreground">Average Session Time</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center">
                        <p className="text-xl font-bold">892</p>
                        <p className="text-xs text-muted-foreground">Daily Active Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">2.3</p>
                        <p className="text-xs text-muted-foreground">Pages per Session</p>
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
                  <CardTitle>Top Performing Courses</CardTitle>
                  <CardDescription>Most popular courses by enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.courseMetrics.topCourses.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.enrollments}</TableCell>
                          <TableCell>${course.revenue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Categories</CardTitle>
                  <CardDescription>Distribution by subject category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.courseMetrics.categoryDistribution.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm">{category.percentage}%</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                  <CardDescription>Breakdown of revenue by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.revenueMetrics.revenueBySource.map((source, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{source.source}</span>
                          <span className="text-sm">${source.amount}</span>
                        </div>
                        <Progress value={source.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>Revenue performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.revenueMetrics.monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{month.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(month.revenue / 6000) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">${month.revenue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lecture Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">85%</p>
                    <p className="text-sm text-muted-foreground">Average Attendance Rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">72%</p>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">4.7</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
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