import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  Video,
  FileText,
  MessageSquare,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  Eye,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface LectureDetailsData {
  id: string;
  title: string;
  description: string;
  trainer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    experience: number;
    expertise: string[];
    bio: string;
    rating: number;
    totalLectures: number;
  };
  scheduledAt: string;
  duration: number;
  price: number;
  maxStudents: number;
  enrolledStudents: Array<{
    id: string;
    name: string;
    email: string;
    enrolledAt: string;
    attended?: boolean;
  }>;
  category: string;
  tags: string[];
  status: string;
  materials: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  feedback: Array<{
    student: {
      name: string;
      avatar?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  meetingLink?: string;
  recordingUrl?: string;
  thumbnail?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  rejectedAt?: string;
  rejectedBy?: {
    id: string;
    name: string;
    email: string;
  };
  rejectionReason?: string;
}

export const AdminLectureDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState<LectureDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadLectureDetails();
    }
  }, [id]);

  const loadLectureDetails = async () => {
    try {
      setLoading(true);
      const data = await adminService.getLectureById(id!);
      setLecture(data);
    } catch (error) {
      console.error('Error loading lecture details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lecture details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLecture = async () => {
    if (!lecture) return;
    
    try {
      setActionLoading(true);
      await adminService.approveLecture(lecture.id);
      toast({
        title: 'Success',
        description: 'Lecture approved successfully! Trainer has been notified.',
      });
      // Redirect back to manage lectures page
      navigate('/admin/manage-lectures');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve lecture',
        variant: 'destructive',
      });
      setActionLoading(false);
    }
  };

  const handleRejectLecture = async () => {
    if (!lecture) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await adminService.rejectLecture(lecture.id, reason);
      toast({
        title: 'Success',
        description: 'Lecture rejected. Trainer has been notified.',
      });
      // Redirect back to manage lectures page
      navigate('/admin/manage-lectures');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject lecture',
        variant: 'destructive',
      });
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      live: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    }[status] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <Badge variant="outline" className={styles}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateAverageRating = () => {
    if (!lecture?.feedback || lecture.feedback.length === 0) return 0;
    const sum = lecture.feedback.reduce((acc, review) => acc + review.rating, 0);
    return (sum / lecture.feedback.length).toFixed(1);
  };

  const formatCurrency = (amount: number) => {
    return `${amount} UC`;
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

  if (!lecture) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Lecture not found</h3>
            <p className="text-muted-foreground mb-4">
              The lecture you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/admin/manage-lectures')}>
              Back to Manage Lectures
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/manage-lectures')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Manage Lectures
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge(lecture.status)}
              <Badge variant="outline">{lecture.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{lecture.title}</h1>
            <p className="text-muted-foreground text-lg">{lecture.description}</p>
          </div>
          
          {lecture.status === 'pending' && (
            <div className="flex gap-2">
              <Button 
                onClick={handleApproveLecture}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button 
                variant="destructive"
                onClick={handleRejectLecture}
                disabled={actionLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lecture Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lecture Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Date</span>
                  </div>
                  <p className="font-medium">
                    {new Date(lecture.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Time</span>
                  </div>
                  <p className="font-medium">
                    {new Date(lecture.scheduledAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="font-medium">{lecture.duration} minutes</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Price</span>
                  </div>
                  <p className="font-medium">{formatCurrency(lecture.price)}</p>
                </div>
              </div>

              {lecture.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Topics Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {lecture.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trainer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Trainer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={lecture.trainer.avatar} />
                  <AvatarFallback className="text-lg">
                    {lecture.trainer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{lecture.trainer.name}</h3>
                  <p className="text-muted-foreground mb-2">{lecture.trainer.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{lecture.trainer.experience} years experience</span>
                    <span>•</span>
                    <span>{lecture.trainer.totalLectures} lectures</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{lecture.trainer.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-sm text-muted-foreground">{lecture.trainer.bio}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {lecture.trainer.expertise.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          {lecture.materials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lecture.materials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-muted-foreground">{material.type}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Feedback */}
          {lecture.status === 'completed' && lecture.feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Student Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {calculateAverageRating()}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(Number(calculateAverageRating())) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on {lecture.feedback.length} reviews
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {lecture.feedback.map((review, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.student.avatar} />
                            <AvatarFallback>
                              {review.student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Enrollment Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {lecture.enrolledStudents.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    out of {lecture.maxStudents} seats
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Enrollment Progress</span>
                    <span className="font-medium">
                      {Math.round((lecture.enrolledStudents.length / lecture.maxStudents) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(lecture.enrolledStudents.length / lecture.maxStudents) * 100} 
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Revenue Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(lecture.enrolledStudents.length * lecture.price)}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per student</span>
                    <span className="font-medium">{formatCurrency(lecture.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students enrolled</span>
                    <span className="font-medium">{lecture.enrolledStudents.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee (15%)</span>
                    <span className="font-medium">
                      {formatCurrency(lecture.enrolledStudents.length * lecture.price * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Trainer earnings</span>
                    <span className="text-green-600">
                      {formatCurrency(lecture.enrolledStudents.length * lecture.price * 0.85)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action History */}
          {(lecture.approvedAt || lecture.rejectedAt) && (
            <Card>
              <CardHeader>
                <CardTitle>Action History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(lecture.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {lecture.approvedAt && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Approved</p>
                    <p className="font-medium">
                      {new Date(lecture.approvedAt).toLocaleDateString()}
                    </p>
                    {lecture.approvedBy && (
                      <p className="text-xs text-muted-foreground">by {typeof lecture.approvedBy === 'string' ? lecture.approvedBy : (lecture.approvedBy.name || lecture.approvedBy.email)}</p>
                    )}
                  </div>
                )}
                
                {lecture.rejectedAt && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Rejected</p>
                    <p className="font-medium">
                      {new Date(lecture.rejectedAt).toLocaleDateString()}
                    </p>
                    {lecture.rejectedBy && (
                      <p className="text-xs text-muted-foreground">by {typeof lecture.rejectedBy === 'string' ? lecture.rejectedBy : (lecture.rejectedBy.name || lecture.rejectedBy.email)}</p>
                    )}
                    {lecture.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                        <p className="text-xs text-red-800 dark:text-red-200">
                          <strong>Reason:</strong> {lecture.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enrolled Students */}
          {lecture.enrolledStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {lecture.enrolledStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-muted-foreground text-xs">{student.email}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
