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
  Radio
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { lectureService, Lecture } from '@/services/lectureService';

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


  const handleJoinMeeting = () => {
    if (lecture) {
      navigate(`/meeting/${lecture.id}`);
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
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      live: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    }[status] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <Badge variant="outline" className={`${styles}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
                    <Button variant="outline" onClick={() => navigate(`/trainer/lectures/${lecture.id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {lecture.status === 'live' && (
                    <>
                      <Button className="bg-red-600 hover:bg-red-700 animate-pulse" onClick={handleJoinMeeting}>
                        <Radio className="w-4 h-4 mr-2" />
                        🔴 Join Live
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

          {/* Student Feedback */}
          {lecture.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {lecture.feedback.length > 0 ? (
                  <div className="space-y-4">
                    {lecture.feedback.map((review, index) => (
                      <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={review.student.avatar} />
                              <AvatarFallback>
                                {review.student.firstname[0]}{review.student.lastname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {review.student.firstname} {review.student.lastname}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
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
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No feedback received yet
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Meeting Section */}
          {lecture.status === 'live' && (
            <Card className="border-red-500 border-2">
              <CardHeader className="bg-red-50">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-600 animate-pulse" />
                  <CardTitle className="text-red-700">🔴 LIVE NOW</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Your lecture is currently live. Join now to interact with your students.
                </p>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-lg py-6" 
                  onClick={handleJoinMeeting}
                >
                  <Video className="w-5 h-5 mr-2" />
                  Join Live Meeting
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Enrollment Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Enrolled</span>
                  <span className="font-medium">
                    {lecture.enrolledCount}/{lecture.maxStudents}
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full"
                    style={{ 
                      width: `${(lecture.enrolledCount / lecture.maxStudents) * 100}%`
                    }}
                  />
                </div>
                {lecture.isFull && (
                  <p className="text-sm text-orange-600">
                    This lecture is full
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {lecture.status === 'scheduled' && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => window.open(lecture.meetingLink || '#', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Meeting Link
                </Button>
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
                        <Badge variant={enrollment.attended ? "success" : "secondary"}>
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