import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  Users, 
  PlayCircle, 
  CheckCircle,
  XCircle,
  Star,
  BookOpen,
  Video,
  FileText,
  Download,
  MessageSquare,
  AlertCircle,
  Filter,
  Search,
  ExternalLink,
  Timer,
  Award,
  TrendingUp,
  Eye,
  Plus,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { lectureService, Lecture } from '@/services/lectureService';
import { toast } from 'sonner';

interface LectureStats {
  totalEnrolled: number;
  upcoming: number;
  completed: number;
  missed: number;
  completionRate: number;
  totalHours: number;
}

export const MyLectures: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [myLectures, setMyLectures] = useState<Lecture[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<LectureStats>({
    totalEnrolled: 0,
    upcoming: 0,
    completed: 0,
    missed: 0,
    completionRate: 0,
    totalHours: 0
  });
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    fetchMyLectures();
  }, []);

  const fetchMyLectures = async () => {
    try {
      setLoading(true);
      const lectures = await lectureService.getMyLectures();
      setMyLectures(lectures);
      
      // Calculate stats
      const now = new Date();
      const upcoming = lectures.filter(lecture => 
        new Date(lecture.scheduledAt) > now && lecture.status === 'scheduled'
      ).length;
      
      const completed = lectures.filter(lecture => 
        lecture.status === 'completed'
      ).length;
      
      const missed = lectures.filter(lecture => 
        new Date(lecture.scheduledAt) < now && 
        lecture.status === 'scheduled' && 
        !lecture.enrolledStudents.some(enrollment => enrollment.attended)
      ).length;

      const totalHours = lectures.reduce((sum, lecture) => sum + (lecture.duration / 60), 0);
      
      setStats({
        totalEnrolled: lectures.length,
        upcoming,
        completed,
        missed,
        completionRate: lectures.length > 0 ? Math.round((completed / lectures.length) * 100) : 0,
        totalHours: Math.round(totalHours * 10) / 10
      });
      
    } catch (error) {
      console.error('Error fetching my lectures:', error);
      toast.error('Failed to load your lectures');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (lectureId: string) => {
    try {
      await lectureService.unenrollFromLecture(lectureId);
      toast.success('Successfully unenrolled from lecture');
      fetchMyLectures(); // Refresh the list
    } catch (error: any) {
      console.error('Error unenrolling:', error);
      toast.error(error.message || 'Failed to unenroll from lecture');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedLecture || feedbackRating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      // Submit feedback to backend
      const result = await lectureService.submitReview(selectedLecture.id, {
        rating: feedbackRating,
        comment: feedbackComment
      });
      
      toast.success(result.message || 'Thank you for your feedback!');
      setShowFeedbackDialog(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setSelectedLecture(null);
      
      // Refresh the lectures list to show updated review
      fetchMyLectures();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    }
  };

  const getLectureStatus = (lecture: Lecture) => {
    const now = new Date();
    const lectureTime = new Date(lecture.scheduledAt);
    
    if (lecture.status === 'live') return 'live';
    if (lecture.status === 'completed') return 'completed';
    if (lecture.status === 'cancelled') return 'cancelled';
    if (lectureTime > now) return 'upcoming';
    
    // Check if student attended
    const enrollment = lecture.enrolledStudents.find(e => e.attended);
    if (enrollment?.attended) return 'completed';
    
    return 'missed';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Radio className="w-4 h-4 text-red-600 animate-pulse" />;
      case 'upcoming':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'missed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-red-700 bg-red-100 border-red-200 animate-pulse';
      case 'upcoming':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'completed':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'missed':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'cancelled':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      default:
        return 'text-muted-foreground bg-muted border-muted';
    }
  };

  const filteredLectures = myLectures.filter(lecture => {
    const status = getLectureStatus(lecture);
    const matchesTab = selectedTab === 'all' || status === selectedTab;
    const matchesSearch = searchTerm === '' || 
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${lecture.trainer.firstname} ${lecture.trainer.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusCardColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-50 border-red-300 border-2 hover:bg-red-100';
      case 'upcoming':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'completed':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'missed':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'cancelled':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      default:
        return 'bg-muted/50 hover:bg-muted';
    }
  };

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const LectureCard = ({ lecture }: { lecture: Lecture }) => {
    const status = getLectureStatus(lecture);
    const trainerName = `${lecture.trainer.firstname} ${lecture.trainer.lastname}`;
    const trainerAvatar = lecture.trainer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lecture.trainer.firstname}`;
    const canUnenroll = status === 'upcoming' && new Date(lecture.scheduledAt).getTime() - new Date().getTime() > 2 * 60 * 60 * 1000; // 2 hours before

    return (
      <Card className={cn("card-elevated hover-lift transition-all duration-300", getStatusCardColor(status))}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <Badge className={cn("text-xs border", getStatusColor(status))}>
              {getStatusIcon(status)}
              <span className="ml-1 capitalize">{status}</span>
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {lecture.category}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 cursor-pointer hover:text-primary" 
                     onClick={() => navigate(`/student/lecture/${lecture.id}`)}>
            {lecture.title}
          </CardTitle>
          <CardDescription className="flex items-center space-x-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={trainerAvatar} />
              <AvatarFallback className="text-xs">
                {lecture.trainer.firstname[0]}{lecture.trainer.lastname[0]}
              </AvatarFallback>
            </Avatar>
            <span>by {trainerName}</span>
          </CardDescription>
        </CardHeader>
        
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-2 cursor-pointer hover:text-primary" 
                     onClick={() => navigate(`/student/lecture/${lecture.id}`)}>
            {lecture.title}
          </CardTitle>
          <CardDescription className="flex items-center space-x-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={trainerAvatar} />
              <AvatarFallback className="text-xs">
                {lecture.trainer.firstname[0]}{lecture.trainer.lastname[0]}
              </AvatarFallback>
            </Avatar>
            <span>by {trainerName}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {formatScheduledTime(lecture.scheduledAt)}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {lecture.duration} min
              </div>
            </div>

            {status === 'completed' && lecture.averageRating > 0 && (
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border">
                <span className="text-sm font-medium">Your Rating:</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{lecture.averageRating.toFixed(1)}</span>
                </div>
              </div>
            )}

            {lecture.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {lecture.description}
              </p>
            )}

            <div className="flex gap-2">
              {status === 'live' && (
                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 animate-pulse"
                        onClick={() => navigate(`/meeting/${lecture.id}`)}>
                  <Radio className="w-4 h-4 mr-1" />
                  🔴 Join Live
                </Button>
              )}

              {status === 'upcoming' && (
                <Button size="sm" className="flex-1 btn-primary"
                        onClick={() => navigate(`/student/lecture/${lecture.id}`)}>
                  <PlayCircle className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              )}
              
              {/* {status === 'completed' && (
                <Button size="sm" variant="outline" className="flex-1"
                        onClick={() => window.open(lecture.recordingUrl || '#', '_blank')}>
                  <Video className="w-4 h-4 mr-1" />
                  Watch Recording
                </Button>
              )} */}
              
              {status === 'completed' && (
                <Button size="sm" variant="ghost"
                        onClick={() => {
                          setSelectedLecture(lecture);
                          setShowFeedbackDialog(true);
                        }}>
                  <Star className="w-4 h-4" />
                </Button>
              )}
              
              {/* {status === 'missed' && (
                <Button size="sm" variant="outline" className="flex-1"
                        onClick={() => window.open(lecture.recordingUrl || '#', '_blank')}>
                  <Video className="w-4 h-4 mr-1" />
                  Watch Recording
                </Button>
              )} */}

              {status !== 'live' && (
                <Button size="sm" variant="ghost"
                        onClick={() => navigate(`/student/lecture/${lecture.id}`)}>
                  <Eye className="w-4 h-4" />
                </Button>
              )}

              {canUnenroll && (
                <Button size="sm" variant="destructive" 
                        onClick={() => handleUnenroll(lecture.id)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </div>

            {lecture.materials.length > 0 && (
              <div className="pt-3 border-t border-white/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Materials:</span>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{lecture.materials.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardHeader>
                <div className="flex justify-between mb-2">
                  <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-12 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-8 bg-muted rounded animate-pulse w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Lectures</h1>
          <p className="text-muted-foreground">
            Manage and track your enrolled lectures and learning progress
          </p>
        </div>
        <Button asChild>
          <Link to="/student/browse-lectures">
            <Plus className="w-4 h-4 mr-2" />
            Browse More
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHours}h total learning
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Ready to learn
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Knowledge gained
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <Award className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{Math.floor(stats.completed / 3)}</div>
            <p className="text-xs text-muted-foreground">
              Badges earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="card-elevated">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search lectures, trainers, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lectures Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({stats.totalEnrolled})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({stats.upcoming})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="missed">Missed ({stats.missed})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredLectures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          ) : (
            <Card className="card-elevated">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? 'No matching lectures found' : `No ${selectedTab === 'all' ? '' : selectedTab} lectures found`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? `No lectures match "${searchTerm}". Try adjusting your search.`
                    : selectedTab === 'upcoming' 
                    ? "You don't have any upcoming lectures scheduled."
                    : selectedTab === 'completed'
                    ? "You haven't completed any lectures yet."
                    : selectedTab === 'missed'
                    ? "You haven't missed any lectures."
                    : "You haven't enrolled in any lectures yet."
                  }
                </p>
                <Button asChild>
                  <Link to="/student/browse-lectures">
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Lectures
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              How was your experience with "{selectedLecture?.title}"?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFeedbackRating(rating)}
                    className="p-1"
                  >
                    <Star 
                      className={cn(
                        "w-6 h-6 transition-colors",
                        rating <= feedbackRating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground hover:text-yellow-400"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
              <Textarea
                placeholder="Share your thoughts about this lecture..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitFeedback}
                disabled={feedbackRating === 0}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};