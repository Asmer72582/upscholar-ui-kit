import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  RefreshCw,
  Star,
  CheckCircle,
  Settings,
  Radio,
  Video
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { lectureService, Lecture } from '@/services/lectureService';

export const ManageLectures: React.FC = () => {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    setLoading(true);
    try {
      const myLectures = await lectureService.getMyLectures();
      setLectures(myLectures);
    } catch (error: any) {
      console.error('Error loading lectures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lectures. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) {
      return;
    }

    try {
      await lectureService.deleteLecture(lectureId);
      toast({
        title: 'Success',
        description: 'Lecture deleted successfully.',
      });
      loadLectures(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting lecture:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete lecture.',
        variant: 'destructive',
      });
    }
  };

  const handleStartMeeting = async (lectureId: string, lectureTitle: string) => {
    try {
      const token = localStorage.getItem('upscholer_token');
      const response = await fetch(`${API_URL}/lectures/${lectureId}/start-meeting`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start meeting');
      }

      const data = await response.json();
      toast({
        title: 'Success',
        description: data.message || 'Meeting started successfully!',
      });
      
      // Navigate to meeting room
      navigate(`/meeting/${lectureId}`);
    } catch (error: any) {
      console.error('Error starting meeting:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start meeting',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteLecture = async (lectureId: string, lectureTitle: string) => {
    if (!confirm(`Are you sure you want to mark "${lectureTitle}" as completed?`)) {
      return;
    }

    try {
      await lectureService.completeLecture(lectureId);
      toast({
        title: 'Success',
        description: 'Lecture marked as completed successfully.',
      });
      loadLectures(); // Refresh the list
    } catch (error: any) {
      console.error('Error completing lecture:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete lecture.',
        variant: 'destructive',
      });
    }
  };

  const handleEditLecture = (lectureId: string) => {
    // Navigate to edit page - we'll create this route
    navigate(`/trainer/lectures/${lectureId}/edit`);
  };

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecture.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lecture.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || lecture.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string, rejectionReason?: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Approval
          </Badge>
        );
      case 'scheduled':
        return <Badge className="bg-green-100 text-green-800">Approved - Scheduled</Badge>;
      case 'live':
        return (
          <Badge className="bg-red-100 text-red-800 animate-pulse flex items-center gap-1">
            <Radio className="w-3 h-3" />
            🔴 LIVE
          </Badge>
        );
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1" title={rejectionReason}>
            {rejectionReason ? 'Rejected' : 'Cancelled'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateStats = () => {
    const totalLectures = lectures.length;
    const pendingLectures = lectures.filter(l => l.status === 'pending').length;
    const scheduledLectures = lectures.filter(l => l.status === 'scheduled').length;
    const liveLectures = lectures.filter(l => l.status === 'live').length;
    const completedLectures = lectures.filter(l => l.status === 'completed').length;
    const totalStudents = lectures.reduce((sum, l) => sum + l.enrolledCount, 0);
    const totalEarnings = lectures.reduce((sum, l) => sum + l.totalEarnings, 0);
    const averageRating = lectures.length > 0 
      ? lectures.reduce((sum, l) => sum + l.averageRating, 0) / lectures.length 
      : 0;

    return {
      totalLectures,
      pendingLectures,
      scheduledLectures,
      liveLectures,
      completedLectures,
      totalStudents,
      totalEarnings,
      averageRating: Math.round(averageRating * 10) / 10
    };
  };

  const stats = calculateStats();

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
          <p className="text-muted-foreground">Create, edit, and manage your lectures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadLectures}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/trainer/schedule-lecture')}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule New Lecture
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Pending Alert Banner */}
        {stats.pendingLectures > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-yellow-800">
                    {stats.pendingLectures} lecture{stats.pendingLectures > 1 ? 's' : ''} pending approval
                  </p>
                  <p className="text-sm text-yellow-700">
                    Your lectures are being reviewed by admin. They will be visible to students once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalLectures}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className={stats.pendingLectures > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-700">{stats.pendingLectures}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{stats.scheduledLectures}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Play className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.completedLectures}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold">{stats.totalEarnings}</p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{stats.averageRating}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({lectures.length})</TabsTrigger>
            <TabsTrigger value="pending" className={stats.pendingLectures > 0 ? 'text-yellow-700' : ''}>
              Pending ({stats.pendingLectures})
            </TabsTrigger>
            <TabsTrigger value="scheduled">Approved ({stats.scheduledLectures})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completedLectures})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Lectures</CardTitle>
                    <CardDescription>Manage all your lectures</CardDescription>
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
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Social Studies">Social Studies</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="scheduled">Approved</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled/Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lectures Table */}
                {filteredLectures.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No lectures found</h3>
                    <p className="text-muted-foreground mb-4">
                      {lectures.length === 0 
                        ? "You haven't created any lectures yet." 
                        : "No lectures match your current filters."
                      }
                    </p>
                    {lectures.length === 0 && (
                      <Button onClick={() => navigate('/trainer/schedule-lecture')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Your First Lecture
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lecture</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Earnings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLectures.map((lecture) => (
                        <TableRow key={lecture.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{lecture.title}</p>
                              <p className="text-sm text-muted-foreground">{lecture.category}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{new Date(lecture.scheduledAt).toLocaleDateString()}</p>
                              <p className="text-muted-foreground">
                                {new Date(lecture.scheduledAt).toLocaleTimeString()} • {lecture.duration}min
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{lecture.enrolledCount}/{lecture.maxStudents}</p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${(lecture.enrolledCount / lecture.maxStudents) * 100}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{lecture.totalEarnings} UC</p>
                              <p className="text-muted-foreground">{lecture.price} UC each</p>
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
                                <DropdownMenuItem onClick={() => navigate(`/trainer/lectures/${lecture.id}/details`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                
                                {(lecture.status === 'pending' || lecture.status === 'scheduled' || lecture.status === 'live') && (
                                  <DropdownMenuItem onClick={() => handleEditLecture(lecture.id)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Lecture
                                  </DropdownMenuItem>
                                )}
                                
                                {lecture.status === 'pending' && (
                                  <DropdownMenuItem disabled className="text-yellow-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Awaiting Admin Approval
                                  </DropdownMenuItem>
                                )}
                                
                                {lecture.status === 'scheduled' && (
                                  <DropdownMenuItem onClick={() => handleStartMeeting(lecture.id, lecture.title)}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Meeting
                                  </DropdownMenuItem>
                                )}
                                
                                {lecture.status === 'live' && (
                                  <DropdownMenuItem 
                                    onClick={() => navigate(`/meeting/${lecture.id}`)}
                                    className="text-red-600 font-medium"
                                  >
                                    <Radio className="w-4 h-4 mr-2 animate-pulse" />
                                    🔴 Join Live Meeting
                                  </DropdownMenuItem>
                                )}
                                
                                {(lecture.status === 'scheduled' || lecture.status === 'live') && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCompleteLecture(lecture.id, lecture.title)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Complete Lecture
                                  </DropdownMenuItem>
                                )}
                                
                                {lecture.canBeCancelled && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteLecture(lecture.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Cancel Lecture
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Approval
                </CardTitle>
                <CardDescription>Lectures waiting for admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                {lectures.filter(l => l.status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending lectures</h3>
                    <p className="text-muted-foreground mb-4">All your lectures have been reviewed!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lectures.filter(l => l.status === 'pending').map((lecture) => (
                      <div key={lecture.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{lecture.title}</h3>
                              <p className="text-sm text-muted-foreground">{lecture.category}</p>
                              <p className="text-sm text-muted-foreground">
                                Scheduled: {new Date(lecture.scheduledAt).toLocaleString()} • {lecture.duration} minutes
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Submitted {new Date(lecture.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-yellow-100 text-yellow-800 mb-2">Awaiting Review</Badge>
                            <p className="text-sm font-medium">{lecture.price} UC</p>
                            <p className="text-sm text-muted-foreground">{lecture.maxStudents} max students</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Approved Lectures
                </CardTitle>
                <CardDescription>Lectures approved by admin and visible to students</CardDescription>
              </CardHeader>
              <CardContent>
                {lectures.filter(l => l.status === 'scheduled' || l.status === 'live').length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No approved lectures</h3>
                    <p className="text-muted-foreground mb-4">Your lectures are still being reviewed or you haven't created any.</p>
                    <Button onClick={() => navigate('/trainer/schedule-lecture')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule a Lecture
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lectures.filter(l => l.status === 'scheduled' || l.status === 'live').map((lecture) => (
                      <div key={lecture.id} className={`border rounded-lg p-4 ${lecture.status === 'live' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lecture.status === 'live' ? 'bg-red-100' : 'bg-green-100'}`}>
                              {lecture.status === 'live' ? (
                                <Radio className="w-5 h-5 text-red-600 animate-pulse" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{lecture.title}</h3>
                              <p className="text-sm text-muted-foreground">{lecture.category}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(lecture.scheduledAt).toLocaleString()} • {lecture.duration} minutes
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(lecture.status)}
                            <p className="text-sm font-medium mt-2">{lecture.enrolledCount}/{lecture.maxStudents} students</p>
                            <p className="text-sm text-muted-foreground">{lecture.price} UC</p>
                          </div>
                        </div>
                        {lecture.status === 'live' && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <Button 
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => navigate(`/meeting/${lecture.id}`)}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Live Meeting
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Lectures</CardTitle>
                <CardDescription>Past lectures that have been completed</CardDescription>
              </CardHeader>
              <CardContent>
                {lectures.filter(l => l.status === 'completed').length === 0 ? (
                  <div className="text-center py-8">
                    <Play className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No completed lectures</h3>
                    <p className="text-muted-foreground">You haven't completed any lectures yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lectures.filter(l => l.status === 'completed').map((lecture) => (
                      <div key={lecture.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{lecture.title}</h3>
                            <p className="text-sm text-muted-foreground">{lecture.category}</p>
                            <p className="text-sm text-muted-foreground">
                              Completed on {new Date(lecture.scheduledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{lecture.enrolledCount} students attended</p>
                            <p className="text-sm text-muted-foreground">
                              {lecture.averageRating > 0 && (
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                  {lecture.averageRating}
                                </span>
                              )}
                            </p>
                            <p className="text-sm font-medium text-green-600">{lecture.totalEarnings} UC earned</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};