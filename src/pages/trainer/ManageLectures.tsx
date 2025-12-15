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
  Settings
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'live':
        return <Badge className="bg-green-100 text-green-800">Live</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateStats = () => {
    const totalLectures = lectures.length;
    const pendingLectures = lectures.filter(l => l.status === 'pending').length;
    const scheduledLectures = lectures.filter(l => l.status === 'scheduled').length;
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
        {/* Stats Overview */}
        <div className="grid md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalLectures}</p>
              <p className="text-xs text-muted-foreground">Total Lectures</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">{stats.pendingLectures}</p>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.scheduledLectures}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Play className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{stats.completedLectures}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">{stats.totalEarnings}</p>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{stats.averageRating}</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Lectures ({lectures.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pendingLectures})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({stats.scheduledLectures})</TabsTrigger>
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
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lectures Grid */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLectures.map((lecture) => (
                      <Card 
                        key={lecture.id} 
                        className={`hover-lift cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          lecture.status === 'live' ? 'border-green-200 bg-green-50/50' :
                          lecture.status === 'scheduled' ? 'border-blue-200 bg-blue-50/50' :
                          lecture.status === 'pending' ? 'border-yellow-200 bg-yellow-50/50' :
                          lecture.status === 'completed' ? 'border-gray-200 bg-gray-50/50' :
                          lecture.status === 'cancelled' ? 'border-red-200 bg-red-50/50' :
                          ''
                        }`}
                        onClick={() => navigate(`/trainer/lectures/${lecture.id}/details`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg line-clamp-2">{lecture.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{lecture.category}</p>
                            </div>
                            {getStatusBadge(lecture.status)}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Schedule Info */}
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(lecture.scheduledAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <Clock className="w-4 h-4" />
                            <span>{new Date(lecture.scheduledAt).toLocaleTimeString()}</span>
                          </div>
                          
                          {/* Duration and Price */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{lecture.duration} min</span>
                            </div>
                            <div className="font-semibold text-primary">
                              {lecture.price} UC
                            </div>
                          </div>
                          
                          {/* Students Progress */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{lecture.enrolledCount}/{lecture.maxStudents} students</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {Math.round((lecture.enrolledCount / lecture.maxStudents) * 100)}% full
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${(lecture.enrolledCount / lecture.maxStudents) * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Earnings */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Earnings</span>
                            <span className="font-semibold">{lecture.totalEarnings} UC</span>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex space-x-2 pt-2">
                            {lecture.status === 'scheduled' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartMeeting(lecture.id, lecture.title);
                                }}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </Button>
                            )}
                            
                            {(lecture.status === 'scheduled' || lecture.status === 'live') && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLecture(lecture.id);
                                }}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            )}
                            
                            {(lecture.status === 'scheduled' || lecture.status === 'live') && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-green-600 hover:text-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteLecture(lecture.id, lecture.title);
                                }}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </Button>
                            )}

                            {lecture.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-yellow-600 hover:text-yellow-700 cursor-not-allowed"
                                disabled
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                Pending Approval
                              </Button>
                            )}
                            
                            {lecture.canBeCancelled && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-red-600 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLecture(lecture.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Lectures</CardTitle>
                <CardDescription>Upcoming lectures that are scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                {lectures.filter(l => l.status === 'scheduled').length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No scheduled lectures</h3>
                    <p className="text-muted-foreground mb-4">You don't have any upcoming lectures.</p>
                    <Button onClick={() => navigate('/trainer/schedule-lecture')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule a Lecture
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lectures.filter(l => l.status === 'scheduled').map((lecture) => (
                      <div key={lecture.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{lecture.title}</h3>
                            <p className="text-sm text-muted-foreground">{lecture.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(lecture.scheduledAt).toLocaleString()} • {lecture.duration} minutes
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{lecture.enrolledCount}/{lecture.maxStudents} students</p>
                            <p className="text-sm text-muted-foreground">{lecture.price} UC</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>Lectures waiting for admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                {lectures.filter(l => l.status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending lectures</h3>
                    <p className="text-muted-foreground mb-4">You don't have any lectures waiting for approval.</p>
                    <Button onClick={() => navigate('/trainer/schedule-lecture')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule a New Lecture
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lectures.filter(l => l.status === 'pending').map((lecture) => (
                      <div key={lecture.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{lecture.title}</h3>
                            <p className="text-sm text-muted-foreground">{lecture.category}</p>
                            <p className="text-sm text-muted-foreground">
                              Scheduled for {new Date(lecture.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(lecture.status)}
                          </div>
                        </div>
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