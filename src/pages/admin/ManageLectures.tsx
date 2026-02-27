import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Download, Video, Users, Calendar, RefreshCw, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';
import { lectureService, CreateLectureData } from '@/services/lectureService';

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
  enrolledStudents: Array<{
    student: {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      avatar?: string;
    };
    enrolledAt: string;
    attended?: boolean;
  }>;
  maxStudents: number;
  category: string;
  thumbnail?: string;
  createdAt: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: {
    name: string;
    email: string;
  };
}

interface LectureStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  scheduled: number;
  live: number;
  cancelled: number;
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
    live: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // CRUD state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<LectureData | null>(null);
  const [trainers, setTrainers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [formData, setFormData] = useState<CreateLectureData & { trainerId?: string }>({
    title: '',
    description: '',
    category: '',
    tags: [],
    price: 0,
    duration: 0,
    scheduledAt: '',
    maxStudents: 50,
    meetingLink: '',
    trainerId: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    loadData();
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      const users = await adminService.getAllUsers();
      const trainerList = users
        .filter(u => u.role === 'trainer' && u.isApproved)
        .map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email
        }));
      setTrainers(trainerList);
    } catch (error) {
      console.error('Error loading trainers:', error);
    }
  };

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
      case 'scheduled':
        return <Badge className="bg-green-100 text-green-800">Scheduled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'live':
        return <Badge className="bg-red-100 text-red-800 animate-pulse">🔴 Live</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
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

  // CRUD Handlers
  const handleCreateClick = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: [],
      price: 0,
      duration: 0,
      scheduledAt: '',
      maxStudents: 50,
      meetingLink: '',
      trainerId: trainers[0]?.id || ''
    });
    setTagsInput('');
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEditClick = async (lecture: LectureData) => {
    try {
      const lectureDetails = await adminService.getLectureById(lecture.id);
      const lectureData = lectureDetails.lecture || lectureDetails;
      
      // Parse scheduledAt to separate date and time
      const scheduledDate = new Date(lectureData.scheduledAt || lecture.scheduledAt);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = scheduledDate.toTimeString().slice(0, 5);
      
      setFormData({
        title: lectureData.title || lecture.title,
        description: lectureData.description || '',
        category: lectureData.category || lecture.category,
        tags: lectureData.tags || [],
        price: lectureData.price || lecture.price,
        duration: lectureData.duration || lecture.duration,
        scheduledAt: `${dateStr}T${timeStr}`,
        maxStudents: lectureData.maxStudents || lecture.maxStudents,
        meetingLink: lectureData.meetingLink || '',
        trainerId: lectureData.trainer?._id || lectureData.trainer?.id || ''
      });
      setTagsInput((lectureData.tags || []).join(', '));
      setFormErrors({});
      setSelectedLecture(lecture);
      setShowEditModal(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load lecture details',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (lecture: LectureData) => {
    setSelectedLecture(lecture);
    setShowDeleteDialog(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.trainerId) errors.trainerId = 'Trainer is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.duration || formData.duration <= 0) errors.duration = 'Valid duration is required';
    if (!formData.scheduledAt) errors.scheduledAt = 'Scheduled date/time is required';
    if (!formData.maxStudents || formData.maxStudents <= 0) errors.maxStudents = 'Valid max students is required';
    
    // Validate scheduled time is in the future
    if (formData.scheduledAt) {
      const scheduledTime = new Date(formData.scheduledAt);
      if (scheduledTime <= new Date()) {
        errors.scheduledAt = 'Scheduled time must be in the future';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setActionLoading('create');
      const lectureData: CreateLectureData & { trainerId?: string } = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: tagsInput.split(',').map(t => t.trim()).filter(t => t),
        price: formData.price,
        duration: formData.duration,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        maxStudents: formData.maxStudents,
        meetingLink: formData.meetingLink || undefined,
        trainerId: formData.trainerId // Admin creating lecture on behalf of trainer
      };
      
      await lectureService.createLecture(lectureData);
      
      toast({
        title: 'Success',
        description: 'Lecture created successfully',
      });
      setShowCreateModal(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lecture',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!validateForm() || !selectedLecture) return;
    
    try {
      setActionLoading(selectedLecture.id);
      const updateData: Partial<CreateLectureData> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: tagsInput.split(',').map(t => t.trim()).filter(t => t),
        price: formData.price,
        duration: formData.duration,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        maxStudents: formData.maxStudents,
        meetingLink: formData.meetingLink || undefined
      };
      
      await lectureService.updateLecture(selectedLecture.id, updateData);
      
      toast({
        title: 'Success',
        description: 'Lecture updated successfully',
      });
      setShowEditModal(false);
      setSelectedLecture(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update lecture',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLecture) return;
    
    try {
      setActionLoading(selectedLecture.id);
      await lectureService.deleteLecture(selectedLecture.id);
      
      toast({
        title: 'Success',
        description: 'Lecture deleted successfully',
      });
      setShowDeleteDialog(false);
      setSelectedLecture(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete lecture',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
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
        <div className="flex gap-2">
          <Button onClick={handleCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Create Lecture
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
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
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="text-2xl font-bold">{lectureStats.cancelled}</p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Lectures</TabsTrigger>
            <TabsTrigger value="pending">Pending Review ({lectureStats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({lectureStats.cancelled})</TabsTrigger>
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
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Geography">Geography</SelectItem>
                      <SelectItem value="Economics">Economics</SelectItem>
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
                              <DropdownMenuItem 
                                onClick={() => handleEditClick(lecture)}
                                disabled={actionLoading === lecture.id || lecture.status === 'live' || lecture.status === 'completed'}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {lecture.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => approveLecture(lecture.id)}
                                    disabled={actionLoading === lecture.id}
                                  >
                                    {actionLoading === lecture.id ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
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
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteClick(lecture)}
                                disabled={actionLoading === lecture.id || lecture.status === 'live' || lecture.enrolledStudents.length > 0}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
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
                                {actionLoading === lecture.id ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
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
                <CardTitle>Scheduled Lectures ({lectureStats.scheduled})</CardTitle>
                <CardDescription>Approved lectures ready to go live</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLectures.filter(l => l.status === 'scheduled' || l.status === 'live').map((lecture) => (
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
                {filteredLectures.filter(l => l.status === 'scheduled' || l.status === 'live').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No scheduled lectures found</p>
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

          <TabsContent value="cancelled" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled Lectures ({lectureStats.cancelled})</CardTitle>
                <CardDescription>Lectures cancelled by trainers with reasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLectures.filter(l => l.status === 'cancelled').map((lecture) => (
                    <Card key={lecture.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Video className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="font-medium">{lecture.title}</h4>
                                <p className="text-sm text-muted-foreground">by {lecture.trainer.name}</p>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Cancellation Reason:</p>
                              <p className="text-sm text-gray-600">{lecture.rejectionReason || 'No reason provided'}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span>Scheduled: {new Date(lecture.scheduledAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Cancelled: {new Date(lecture.rejectedAt || '').toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{lecture.enrolledStudents.length} enrolled students</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredLectures.filter(l => l.status === 'cancelled').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No cancelled lectures found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Lecture Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lecture</DialogTitle>
            <DialogDescription>Create a new lecture on behalf of a trainer</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Title *</Label>
                <Input
                  id="create-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Lecture title"
                />
                {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-trainer">Trainer *</Label>
                <Select value={formData.trainerId} onValueChange={(value) => setFormData({ ...formData, trainerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} ({trainer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.trainerId && <p className="text-sm text-red-500">{formErrors.trainerId}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description *</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Lecture description"
                rows={4}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-price">Price (UC) *</Label>
                <Input
                  id="create-price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-duration">Duration (min) *</Label>
                <Input
                  id="create-duration"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  placeholder="60"
                  min="15"
                />
                {formErrors.duration && <p className="text-sm text-red-500">{formErrors.duration}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-scheduled">Scheduled Date/Time *</Label>
                <Input
                  id="create-scheduled"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
                {formErrors.scheduledAt && <p className="text-sm text-red-500">{formErrors.scheduledAt}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-maxStudents">Max Students *</Label>
                <Input
                  id="create-maxStudents"
                  type="number"
                  value={formData.maxStudents || ''}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 50 })}
                  placeholder="50"
                  min="1"
                />
                {formErrors.maxStudents && <p className="text-sm text-red-500">{formErrors.maxStudents}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-tags">Tags (comma-separated)</Label>
                <Input
                  id="create-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-meetingLink">Meeting Link</Label>
              <Input
                id="create-meetingLink"
                value={formData.meetingLink || ''}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="Optional meeting link"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={actionLoading === 'create'}>
              {actionLoading === 'create' ? 'Creating...' : 'Create Lecture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lecture Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lecture</DialogTitle>
            <DialogDescription>Update lecture details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Lecture title"
                />
                {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-trainer">Trainer</Label>
                <Select value={formData.trainerId} onValueChange={(value) => setFormData({ ...formData, trainerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} ({trainer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Lecture description"
                rows={4}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (UC) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (min) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  placeholder="60"
                  min="15"
                />
                {formErrors.duration && <p className="text-sm text-red-500">{formErrors.duration}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-scheduled">Scheduled Date/Time *</Label>
                <Input
                  id="edit-scheduled"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
                {formErrors.scheduledAt && <p className="text-sm text-red-500">{formErrors.scheduledAt}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxStudents">Max Students *</Label>
                <Input
                  id="edit-maxStudents"
                  type="number"
                  value={formData.maxStudents || ''}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 50 })}
                  placeholder="50"
                  min="1"
                />
                {formErrors.maxStudents && <p className="text-sm text-red-500">{formErrors.maxStudents}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meetingLink">Meeting Link</Label>
              <Input
                id="edit-meetingLink"
                value={formData.meetingLink || ''}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="Optional meeting link"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={!selectedLecture || actionLoading === selectedLecture.id}>
              {actionLoading === selectedLecture?.id ? 'Updating...' : 'Update Lecture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lecture
              {selectedLecture && ` "${selectedLecture.title}"`}.
              {selectedLecture && selectedLecture.enrolledStudents.length > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: This lecture has {selectedLecture.enrolledStudents.length} enrolled student(s). 
                  Deletion is not allowed when students are enrolled.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={!selectedLecture || actionLoading === selectedLecture.id || selectedLecture.enrolledStudents.length > 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === selectedLecture?.id ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
