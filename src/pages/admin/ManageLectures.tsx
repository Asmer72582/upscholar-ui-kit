import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Download, Video, Users, Calendar, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';

interface LectureData {
  id: string;
  title: string;
  trainer: {
    name: string;
    email: string;
  };
  scheduledAt: string;
  duration: number;
  price: number;
  status: string;
  enrolledStudents: any[];
  maxStudents: number;
  category: string;
  thumbnail?: string;
  createdAt: string;
}

interface LectureStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  scheduled: number;
  live: number;
}

export const ManageLectures: React.FC = () => {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<LectureData[]>([]);
  const [lectureStats, setLectureStats] = useState<LectureStats>({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    scheduled: 0,
    live: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lecturesData, statsData] = await Promise.all([
        adminService.getAllLectures(),
        adminService.getLectureStats()
      ]);
      setLectures(lecturesData);
      setLectureStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lectures data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecture.trainer.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  const approveLecture = async (lectureId: string) => {
    try {
      setActionLoading(lectureId);
      await adminService.approveLecture(lectureId);
      toast({
        title: 'Success',
        description: 'Lecture approved successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve lecture',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const rejectLecture = async (lectureId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(lectureId);
      await adminService.rejectLecture(lectureId, reason);
      toast({
        title: 'Success',
        description: 'Lecture rejected successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject lecture',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const viewLectureDetails = (lectureId: string) => {
    navigate(`/admin/lectures/${lectureId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Lectures</h1>
          <p className="text-muted-foreground">Review and manage lecture submissions</p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
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
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadData}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
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
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
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
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
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
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Video className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{lecture.title}</p>
                              <p className="text-sm text-muted-foreground">{lecture.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lecture.trainer.name}</p>
                            <p className="text-sm text-muted-foreground">{lecture.trainer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(lecture.scheduledAt).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">
                              {new Date(lecture.scheduledAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} ({lecture.duration}min)
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{lecture.price} UC</p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{lecture.enrolledStudents.length}/{lecture.maxStudents}</p>
                            <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                              <div 
                                className="bg-primary h-1 rounded-full"
                                style={{ width: `${(lecture.enrolledStudents.length / lecture.maxStudents) * 100}%` }}
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
                              <DropdownMenuItem onClick={() => viewLectureDetails(lecture.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {lecture.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => approveLecture(lecture.id)}
                                    disabled={actionLoading === lecture.id}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {actionLoading === lecture.id ? 'Approving...' : 'Approve'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => rejectLecture(lecture.id)}
                                    disabled={actionLoading === lecture.id}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {actionLoading === lecture.id ? 'Rejecting...' : 'Reject'}
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
                    <Card key={lecture.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewLectureDetails(lecture.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{lecture.title}</h4>
                            <p className="text-sm text-muted-foreground">by {lecture.trainer.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(lecture.scheduledAt).toLocaleDateString()} at {new Date(lecture.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => approveLecture(lecture.id)}
                                disabled={actionLoading === lecture.id}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {actionLoading === lecture.id ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="flex-1"
                                onClick={() => rejectLecture(lecture.id)}
                                disabled={actionLoading === lecture.id}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                {actionLoading === lecture.id ? 'Rejecting...' : 'Reject'}
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
                <CardTitle>Approved Lectures ({lectureStats.approved})</CardTitle>
                <CardDescription>Successfully approved lectures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLectures.filter(l => l.status === 'approved').map((lecture) => (
                    <Card key={lecture.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewLectureDetails(lecture.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Video className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{lecture.title}</h4>
                            <p className="text-xs text-muted-foreground">by {lecture.trainer.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(lecture.scheduledAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-medium">{lecture.price} UC</span>
                              <span className="text-xs text-muted-foreground">
                                {lecture.enrolledStudents.length}/{lecture.maxStudents}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredLectures.filter(l => l.status === 'approved').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No approved lectures found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Lectures ({lectureStats.completed})</CardTitle>
                <CardDescription>Lectures that have been conducted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLectures.filter(l => l.status === 'completed').map((lecture) => (
                    <Card key={lecture.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewLectureDetails(lecture.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{lecture.title}</h4>
                            <p className="text-xs text-muted-foreground">by {lecture.trainer.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(lecture.scheduledAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-medium">{lecture.price} UC</span>
                              <span className="text-xs text-green-600 font-medium">Completed</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredLectures.filter(l => l.status === 'completed').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No completed lectures found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
