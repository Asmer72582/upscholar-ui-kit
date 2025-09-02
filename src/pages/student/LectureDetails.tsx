import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Clock, Users, Star, Calendar, Play, BookOpen } from 'lucide-react';

const lectureDetails = {
  id: 1,
  title: 'Introduction to React Hooks',
  description: 'Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks. This comprehensive lecture covers practical examples and real-world applications.',
  trainer: {
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b2e5?w=100&h=100&fit=crop&crop=face',
    bio: 'Senior React Developer with 8+ years of experience',
    rating: 4.9,
    lectures: 23
  },
  price: 50,
  duration: 90,
  rating: 4.8,
  enrolled: 156,
  date: '2024-01-15',
  time: '2:00 PM',
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
  topics: ['useState Hook', 'useEffect Hook', 'Custom Hooks', 'Hook Rules', 'Performance Optimization'],
  reviews: [
    { id: 1, student: 'John Doe', rating: 5, comment: 'Excellent explanation of React Hooks!' },
    { id: 2, student: 'Sarah Johnson', rating: 4, comment: 'Very helpful examples and clear teaching.' }
  ]
};

export const LectureDetails: React.FC = () => {
  const { id } = useParams();

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
                src={lectureDetails.thumbnail} 
                alt={lectureDetails.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Preview
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{lectureDetails.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {lectureDetails.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    {lectureDetails.price} Upcoins
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{lectureDetails.duration} min</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{lectureDetails.date}</p>
                  </div>
                  <div className="text-center">
                    <Star className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{lectureDetails.rating} rating</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{lectureDetails.enrolled} enrolled</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    What you'll learn
                  </h3>
                  <div className="grid gap-2">
                    {lectureDetails.topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lectureDetails.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.student}</span>
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
                    </div>
                  ))}
                </div>
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
                    <AvatarImage src={lectureDetails.trainer.avatar} />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{lectureDetails.trainer.name}</h4>
                    <p className="text-sm text-muted-foreground">{lectureDetails.trainer.bio}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{lectureDetails.trainer.rating}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{lectureDetails.trainer.lectures}</p>
                    <p className="text-xs text-muted-foreground">Lectures</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold">{lectureDetails.price} Upcoins</p>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                </div>
                <Button className="w-full mb-2">
                  Enroll Now
                </Button>
                <Button variant="outline" className="w-full">
                  Add to Wishlist
                </Button>
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
                    <span className="text-sm font-medium">{lectureDetails.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="text-sm font-medium">{lectureDetails.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">{lectureDetails.duration} minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};