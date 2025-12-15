import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Star,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Video,
  FileText,
  MessageSquare,
  Settings,
  BookOpen,
  Trash2,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Download,
  Share2,
  AlertCircle,
  Info,
  Mail
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { lectureService, Lecture } from '@/services/lectureService';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export const TrainerLectureDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLecture();
  }, [id]);

  const loadLecture = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const lectureData = await lectureService.getLectureById(id);
      setLecture(lectureData);
    } catch (error) {
      console.error('Error loading lecture:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load lecture details',
        variant: 'destructive',
      });
      navigate('/trainer/manage-lectures');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLecture = async () => {
    if (!lecture) return;

    if (!window.confirm(`Are you sure you want to mark "${lecture.title}" as completed?`)) {
      return;
    }

    try {
      await lectureService.completeLecture(lecture.id);
      toast({
        title: 'Success',
        description: 'Lecture marked as completed successfully.',
      });
      loadLecture(); // Refresh the lecture data
    } catch (error) {
      console.error('Error completing lecture:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete lecture',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLecture = async () => {
    if (!lecture) return;

    if (!window.confirm(`Are you sure you want to cancel "${lecture.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await lectureService.deleteLecture(lecture.id);
      toast({
        title: 'Success',
        description: 'Lecture cancelled successfully.',
      });
      navigate('/trainer/manage-lectures');
    } catch (error) {
      console.error('Error cancelling lecture:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel lecture',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Lecture not found</h3>
            <p className="text-muted-foreground mb-4">
              The lecture you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/trainer/manage-lectures')}>
              Back to Manage Lectures
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
      live: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
      completed: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
    }[status] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <Badge variant="outline" className={`${styles}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateAverageRating = () => {
    if (!lecture?.feedback || lecture.feedback.length === 0) return 0;
    const sum = lecture.feedback.reduce((acc, review) => acc + review.rating, 0);
    return (sum / lecture.feedback.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    if (!lecture?.feedback) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    lecture.feedback.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount) + ' UC';
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/trainer/manage-lectures')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Manage Lectures
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(lecture.status)}
                    <Badge variant="outline">{lecture.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{lecture.title}</CardTitle>
                  <CardDescription className="text-base">
                    {lecture.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {lecture.status === 'scheduled' && (
                    <>
                      <Button variant="outline" onClick={() => navigate(`/trainer/lectures/${lecture.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteLecture}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {lecture.status === 'live' && (
                    <>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(lecture.meetingLink || '#', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Lecture
                      </Button>
                      <Button variant="outline" onClick={handleCompleteLecture}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <p className="font-medium">{lecture.price} UC</p>
                </div>
              </div>

              {lecture.meetingLink && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Meeting Link</h3>
                  <div className="flex items-center gap-2">
                    <Input value={lecture.meetingLink} readOnly />
                    <Button variant="outline" onClick={() => window.open(lecture.meetingLink, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags and Materials */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Topics Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lecture.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {lecture.materials.length > 0 ? (
                  <div className="space-y-2">
                    {lecture.materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{material.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {material.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No materials uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ratings & Reviews Section */}
          {lecture.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Ratings & Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lecture.feedback.length > 0 ? (
                  <div className="space-y-6">
                    {/* Overall Rating Summary */}
                    <div className="grid md:grid-cols-2 gap-6 pb-6 border-b">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary mb-2">
                          {calculateAverageRating()}
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(Number(calculateAverageRating())) 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on {lecture.feedback.length} {lecture.feedback.length === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                      
                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {Object.entries(getRatingDistribution()).reverse().map(([rating, count]) => (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm w-8">{rating} ⭐</span>
                            <Progress 
                              value={(count / lecture.feedback.length) * 100} 
                              className="h-2 flex-1"
                            />
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Student Reviews
                      </h4>
                      {lecture.feedback.map((review, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.student.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {review.student.firstname[0]}{review.student.lastname[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {review.student.firstname} {review.student.lastname}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-2">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">
                      Students will be able to review after the lecture is completed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lecture Analytics */}
          {lecture.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Lecture Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {lecture.enrolledCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Enrolled</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {lecture.enrolledStudents.filter(e => e.attended).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Attended</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {calculateAverageRating()}
                    </div>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {lecture.enrolledCount * lecture.price}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-sm font-bold text-green-600">
                      {lecture.enrolledCount > 0 
                        ? Math.round((lecture.enrolledStudents.filter(e => e.attended).length / lecture.enrolledCount) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={lecture.enrolledCount > 0 
                      ? (lecture.enrolledStudents.filter(e => e.attended).length / lecture.enrolledCount) * 100
                      : 0} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium">Enrollment Rate</span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round((lecture.enrolledCount / lecture.maxStudents) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(lecture.enrolledCount / lecture.maxStudents) * 100} 
                    className="h-2"
                  />
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
                    {lecture.enrolledCount}
                  </div>
                  <p className="text-sm text-muted-foreground">out of {lecture.maxStudents} seats</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Enrollment Progress</span>
                    <span className="font-medium">
                      {Math.round((lecture.enrolledCount / lecture.maxStudents) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(lecture.enrolledCount / lecture.maxStudents) * 100} 
                    className="h-3"
                  />
                </div>
                
                {lecture.isFull ? (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      Lecture is full
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {lecture.maxStudents - lecture.enrolledCount} seats available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Earnings Card */}
          {lecture.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  Earnings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(lecture.enrolledCount * lecture.price)}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per student</span>
                      <span className="font-medium">{formatCurrency(lecture.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students enrolled</span>
                      <span className="font-medium">{lecture.enrolledCount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Your Earnings</span>
                      <span className="text-green-600">{formatCurrency(lecture.enrolledCount * lecture.price * 0.85)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      * After 15% platform fee
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {lecture.status === 'scheduled' && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lecture.meetingLink && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={() => window.open(lecture.meetingLink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Lecture
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate(`/trainer/lectures/${lecture.id}/edit`)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {lecture.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Lecture Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lecture.recordingUrl ? (
                  <Button variant="outline" className="w-full" onClick={() => window.open(lecture.recordingUrl, '_blank')}>
                    <Video className="w-4 h-4 mr-2" />
                    View Recording
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <Video className="w-4 h-4 mr-2" />
                    No Recording Available
                  </Button>
                )}

                {lecture.materials.length > 0 && (
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    View Materials
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enrolled Students */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Enrolled Students</CardTitle>
                <Badge variant="secondary">{lecture.enrolledCount}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {lecture.enrolledStudents.length > 0 ? (
                <div className="space-y-4">
                  {lecture.enrolledStudents.map((enrollment) => (
                    <div key={enrollment.student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={enrollment.student.avatar} />
                          <AvatarFallback>
                            {enrollment.student.firstname[0]}{enrollment.student.lastname[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {enrollment.student.firstname} {enrollment.student.lastname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {lecture.status === 'completed' && (
                        <Badge 
                          variant="outline"
                          className={enrollment.attended ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300" : "bg-gray-100 text-gray-700 border-gray-200"}
                        >
                          {enrollment.attended ? "Attended" : "Absent"}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No students enrolled yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};