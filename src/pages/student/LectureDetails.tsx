import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Clock, Users, Star, Calendar, Play, BookOpen, Coins, Wallet, CheckCircle, AlertCircle, MessageSquare, ThumbsUp, ExternalLink, Video, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { lectureService, Lecture } from '@/services/lectureService';
import { walletService } from '@/services/walletService';
import { toast } from 'sonner';

export const LectureDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await walletService.getBalance();
        setUserBalance(balance.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, []);

  useEffect(() => {
    const fetchLecture = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const lectureData = await lectureService.getLectureById(id);
        setLecture(lectureData);
        
      } catch (error) {
        console.error('Error fetching lecture:', error);
        toast.error('Failed to load lecture details');
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [id]);

  // Separate effect to check enrollment when both user and lecture are available
  useEffect(() => {
    if (user && lecture) {
      // Check if current user is enrolled
      const enrollment = lecture.enrolledStudents.find(
        (enrollment) => enrollment.student.id === user.id
      );
      setIsEnrolled(!!enrollment);
      
      // Check if user has already reviewed
      const existingReview = lecture.feedback.find(
        (feedback) => feedback.student.id === user.id
      );
      setUserReview(existingReview);
    }
  }, [user, lecture]);

  const handleEnroll = async () => {
    if (!lecture || !id) return;

    try {
      setEnrolling(true);
      
      // Process payment first
      await walletService.processPayment(id, lecture.price);
      
      // Then enroll in lecture
      await lectureService.enrollInLecture(id);
      
      toast.success('Successfully enrolled in lecture!');
      
      // Update balance
      const balance = await walletService.getBalance();
      setUserBalance(balance.balance);
      
      // Refresh lecture data to update enrollment count
      const updatedLecture = await lectureService.getLectureById(id);
      setLecture(updatedLecture);
      setIsEnrolled(true);
      setShowPaymentDialog(false);
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast.error(error.message || 'Failed to enroll in lecture');
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!lecture || !id || reviewRating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      setSubmittingReview(true);
      
      // Submit review to backend
      const result = await lectureService.submitReview(id, { 
        rating: reviewRating, 
        comment: reviewComment 
      });
      
      toast.success(result.message || 'Thank you for your review!');
      setShowReviewDialog(false);
      setReviewRating(0);
      setReviewComment('');
      
      // Refresh lecture data to show new review
      const updatedLecture = await lectureService.getLectureById(id);
      setLecture(updatedLecture);
      
      // Check enrollment status again with updated data
      if (user) {
        const enrollment = updatedLecture.enrolledStudents.find(
          (enrollment) => enrollment.student.id === user.id
        );
        setIsEnrolled(!!enrollment);
        
        const existingReview = updatedLecture.feedback.find(
          (feedback) => feedback.student.id === user.id
        );
        setUserReview(existingReview);
      }
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getLectureStatus = () => {
    if (!lecture) return 'unknown';
    
    const now = new Date();
    const lectureTime = new Date(lecture.scheduledAt);
    
    if (lecture.status === 'completed') return 'completed';
    if (lecture.status === 'cancelled') return 'cancelled';
    if (lectureTime > now) return 'upcoming';
    
    return 'completed'; // Past lectures are considered completed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded-lg" />
                <Card>
                  <CardHeader>
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Lecture not found</h3>
              <p className="text-muted-foreground mb-4">
                The lecture you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/student/browse-lectures')}>
                Browse Lectures
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const trainerName = `${lecture.trainer.firstname} ${lecture.trainer.lastname}`;
  const trainerAvatar = lecture.trainer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lecture.trainer.firstname}`;
  const thumbnail = `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop&seed=${lecture.id}`;
  const canAfford = userBalance >= lecture.price;



  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/student/browse-lectures" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
        </div>



        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <img 
                src={thumbnail} 
                alt={lecture.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Preview
                </Button>
              </div>
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                {lecture.status}
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{lecture.category}</Badge>
                      {lecture.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-2xl">{lecture.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {lecture.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg font-semibold ml-4">
                    <Coins className="w-4 h-4 mr-1" />
                    {lecture.price} UC
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{lecture.duration} min</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{new Date(lecture.scheduledAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <Star className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{lecture.averageRating.toFixed(1)} rating</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{lecture.enrolledCount} enrolled</p>
                  </div>
                </div>

                {lecture.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Topics covered
                    </h3>
                    <div className="grid gap-2">
                      {lecture.tags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lecture.materials.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Materials</h3>
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({lecture.feedback.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {lecture.feedback.length > 0 ? (
                  <div className="space-y-4">
                    {lecture.feedback.slice(0, 5).map((review, index) => (
                      <div key={index} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={review.student.avatar} />
                              <AvatarFallback className="text-xs">
                                {review.student.firstname[0]}{review.student.lastname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {review.student.firstname} {review.student.lastname}
                            </span>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No reviews yet. Be the first to review this lecture!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trainer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Trainer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={trainerAvatar} />
                    <AvatarFallback>
                      {lecture.trainer.firstname[0]}{lecture.trainer.lastname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{trainerName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {lecture.trainer.bio || 'Experienced trainer'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{lecture.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{lecture.trainer.experience || 0}+</p>
                    <p className="text-xs text-muted-foreground">Years Exp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment/Access */}
            <Card>
              <CardContent className="pt-6">
                {isEnrolled ? (
                  // Already enrolled - show access options
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-medium text-green-800">You're Enrolled!</h3>
                      <p className="text-sm text-green-600">
                        You have access to this lecture
                      </p>
                    </div>

                    {(getLectureStatus() === 'upcoming' || getLectureStatus() === 'completed') && lecture.meetingLink && (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={() => window.open(lecture.meetingLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Lecture
                      </Button>
                    )}

                    {getLectureStatus() === 'completed' && (
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(lecture.recordingUrl || '#', '_blank')}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Watch Recording
                        </Button>
                        
                        {lecture.materials.length > 0 && (
                          <Button variant="outline" className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            Download Materials ({lecture.materials.length})
                          </Button>
                        )}

                        {!userReview && (
                          <Button 
                            className="w-full"
                            onClick={() => setShowReviewDialog(true)}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Rate & Review
                          </Button>
                        )}

                        {userReview && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Your Review</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${
                                      i < userReview.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                            {userReview.comment && (
                              <p className="text-sm text-muted-foreground">
                                "{userReview.comment}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Not enrolled - show enrollment options
                  <div>
                    <div className="text-center mb-4">
                      <p className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Coins className="w-6 h-6" />
                        {lecture.price} Upcoins
                      </p>
                      <p className="text-sm text-muted-foreground">One-time payment</p>
                    </div>
                    
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Your Balance:
                        </span>
                        <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                          {userBalance} UC
                        </span>
                      </div>
                    </div>

                    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full mb-2" 
                          disabled={lecture.isFull || lecture.status === 'completed'}
                        >
                          {lecture.isFull ? 'Lecture Full' : 'Enroll Now'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enroll in Lecture</DialogTitle>
                          <DialogDescription>
                            Confirm your enrollment in "{lecture.title}"
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Payment Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Lecture Price:</span>
                                <span>{lecture.price} UC</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Your Balance:</span>
                                <span className={canAfford ? 'text-green-600' : 'text-red-600'}>
                                  {userBalance} UC
                                </span>
                              </div>
                              <div className="flex justify-between font-medium border-t pt-2">
                                <span>After Payment:</span>
                                <span>{userBalance - lecture.price} UC</span>
                              </div>
                            </div>
                          </div>

                          {!canAfford && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 text-red-700">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Insufficient Balance</span>
                              </div>
                              <p className="text-sm text-red-600 mt-1">
                                You need {lecture.price - userBalance} more Upcoins to enroll.
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setShowPaymentDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={handleEnroll}
                              disabled={!canAfford || enrolling}
                            >
                              {enrolling ? 'Processing...' : 'Confirm Enrollment'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="w-full">
                      Add to Wishlist
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="text-sm font-medium">
                      {new Date(lecture.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="text-sm font-medium">
                      {new Date(lecture.scheduledAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">{lecture.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Capacity</span>
                    <span className="text-sm font-medium">
                      {lecture.enrolledCount}/{lecture.maxStudents}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate & Review</DialogTitle>
              <DialogDescription>
                Share your experience with "{lecture?.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating *</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewRating(rating)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          rating <= reviewRating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-muted-foreground hover:text-yellow-400'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {reviewRating === 1 ? 'Poor' : 
                     reviewRating === 2 ? 'Fair' : 
                     reviewRating === 3 ? 'Good' : 
                     reviewRating === 4 ? 'Very Good' : 'Excellent'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
                <Textarea
                  placeholder="Share your thoughts about this lecture, the trainer, and what you learned..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Help other students</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your honest review helps other students make informed decisions about this lecture.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowReviewDialog(false);
                    setReviewRating(0);
                    setReviewComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitReview}
                  disabled={reviewRating === 0 || submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};