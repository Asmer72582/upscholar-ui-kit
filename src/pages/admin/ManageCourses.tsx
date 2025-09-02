import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, BookOpen, Users, Clock, Download } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Complete React Masterclass',
    trainer: 'Jane Smith',
    category: 'Programming',
    level: 'Intermediate',
    price: 299,
    modules: 8,
    lectures: 42,
    duration: 1200,
    enrollments: 156,
    status: 'approved',
    createdAt: '2024-01-01',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Advanced TypeScript Patterns',
    trainer: 'Mike Johnson',
    category: 'Programming',
    level: 'Advanced',
    price: 199,
    modules: 6,
    lectures: 28,
    duration: 800,
    enrollments: 0,
    status: 'pending',
    createdAt: '2024-01-05',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    trainer: 'Sarah Wilson',
    category: 'Design',
    level: 'Beginner',
    price: 149,
    modules: 5,
    lectures: 25,
    duration: 600,
    enrollments: 89,
    status: 'approved',
    createdAt: '2023-12-15',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'Digital Marketing Mastery',
    trainer: 'Alex Brown',
    category: 'Marketing',
    level: 'Intermediate',
    price: 179,
    modules: 7,
    lectures: 35,
    duration: 950,
    enrollments: 0,
    status: 'rejected',
    createdAt: '2024-01-08',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  }
];

const courseStats = {
  total: 89,
  pending: 15,
  approved: 62,
  rejected: 12
};

export const ManageCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.trainer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Beginner':
        return <Badge variant="outline" className="text-green-600">Beginner</Badge>;
      case 'Intermediate':
        return <Badge variant="outline" className="text-blue-600">Intermediate</Badge>;
      case 'Advanced':
        return <Badge variant="outline" className="text-purple-600">Advanced</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const approveCourse = (courseId: number) => {
    console.log('Approving course:', courseId);
  };

  const rejectCourse = (courseId: number) => {
    console.log('Rejecting course:', courseId);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <p className="text-muted-foreground">Review and manage course submissions</p>
      </div>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{courseStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">{courseStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{courseStats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{courseStats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="pending">Pending Review ({courseStats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Management</CardTitle>
                    <CardDescription>View and manage all course submissions</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Courses Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{course.category}</Badge>
                                {getLevelBadge(course.level)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{course.trainer}</p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{course.modules} modules, {course.lectures} lectures</p>
                            <p className="text-muted-foreground">{formatDuration(course.duration)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{course.price} Upcoins</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{course.enrollments}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(course.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {course.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => approveCourse(course.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => rejectCourse(course.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Course Reviews</CardTitle>
                <CardDescription>Courses awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredCourses.filter(c => c.status === 'pending').map((course) => (
                    <Card key={course.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">by {course.trainer}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{course.category}</Badge>
                              {getLevelBadge(course.level)}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => approveCourse(course.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="flex-1"
                                onClick={() => rejectCourse(course.id)}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents would be similar with filtered data */}
          <TabsContent value="approved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Approved Courses</CardTitle>
                <CardDescription>Successfully approved courses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Approved courses list would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Courses</CardTitle>
                <CardDescription>Courses that were rejected</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Rejected courses list would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
