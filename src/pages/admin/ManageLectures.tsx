import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Download, Video, Users, Calendar } from 'lucide-react';

const lectures = [
  {
    id: 1,
    title: 'Introduction to React Hooks',
    trainer: 'Jane Smith',
    date: '2024-01-20',
    time: '2:00 PM',
    duration: 90,
    price: 50,
    status: 'approved',
    enrollments: 25,
    maxStudents: 50,
    category: 'Programming',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Advanced TypeScript Patterns',
    trainer: 'Mike Johnson',
    date: '2024-01-22',
    time: '3:00 PM',
    duration: 120,
    price: 75,
    status: 'pending',
    enrollments: 0,
    maxStudents: 30,
    category: 'Programming',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'UI/UX Design Principles',
    trainer: 'Sarah Wilson',
    date: '2024-01-18',
    time: '1:00 PM',
    duration: 105,
    price: 60,
    status: 'completed',
    enrollments: 45,
    maxStudents: 50,
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'Digital Marketing Strategies',
    trainer: 'Alex Brown',
    date: '2024-01-25',
    time: '4:00 PM',
    duration: 90,
    price: 45,
    status: 'rejected',
    enrollments: 0,
    maxStudents: 40,
    category: 'Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  }
];

const lectureStats = {
  total: 156,
  pending: 12,
  approved: 98,
  completed: 34,
  rejected: 12
};

export const ManageLectures: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecture.trainer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lecture.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || lecture.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const approveLecture = (lectureId: number) => {
    console.log('Approving lecture:', lectureId);
  };

  const rejectLecture = (lectureId: number) => {
    console.log('Rejecting lecture:', lectureId);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Lectures</h1>
        <p className="text-muted-foreground">Review and manage lecture submissions</p>
      </div>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{lectureStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Lectures</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">{lectureStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{lectureStats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{lectureStats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{lectureStats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Lectures</TabsTrigger>
            <TabsTrigger value="pending">Pending Review ({lectureStats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lecture Management</CardTitle>
                    <CardDescription>View and manage all lecture submissions</CardDescription>
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
                      placeholder="Search lectures..."
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lectures Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lecture</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLectures.map((lecture) => (
                      <TableRow key={lecture.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={lecture.thumbnail} 
                              alt={lecture.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{lecture.title}</p>
                              <p className="text-sm text-muted-foreground">{lecture.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{lecture.trainer}</p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{lecture.date}</p>
                            <p className="text-muted-foreground">{lecture.time} ({lecture.duration}min)</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{lecture.price} Upcoins</p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{lecture.enrollments}/{lecture.maxStudents}</p>
                            <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                              <div 
                                className="bg-primary h-1 rounded-full"
                                style={{ width: `${(lecture.enrollments / lecture.maxStudents) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(lecture.status)}</TableCell>
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
                              {lecture.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => approveLecture(lecture.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => rejectLecture(lecture.id)}
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
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>Lectures awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredLectures.filter(l => l.status === 'pending').map((lecture) => (
                    <Card key={lecture.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <img 
                            src={lecture.thumbnail} 
                            alt={lecture.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{lecture.title}</h4>
                            <p className="text-sm text-muted-foreground">by {lecture.trainer}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {lecture.date} at {lecture.time}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => approveLecture(lecture.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="flex-1"
                                onClick={() => rejectLecture(lecture.id)}
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
                <CardTitle>Approved Lectures</CardTitle>
                <CardDescription>Successfully approved lectures</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Approved lectures list would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Lectures</CardTitle>
                <CardDescription>Lectures that have been conducted</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Completed lectures list would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
