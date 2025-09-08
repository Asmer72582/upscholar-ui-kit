import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Course, courseService } from '@/services/courseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Users,
  Star,
  Calendar,
  BookOpen,
  GraduationCap,
  Target,
  CheckCircle,
  PlayCircle,
  Award
} from 'lucide-react';

export const mockLectureDetail = {
  id: 'lecture-1',
  title: 'Introduction to React Hooks',
  description: 'Master the fundamentals of React Hooks and learn how to build modern, functional components with state management.',
  longDescription: `In this comprehensive course, you'll dive deep into React Hooks, the powerful feature that enables you to use state and other React features without writing class components.

You'll learn:
- Understanding the React Hooks ecosystem
- Managing state with useState
- Side effects with useEffect
- Context management with useContext
- Performance optimization with useMemo and useCallback
- Creating custom hooks for reusable logic

By the end of this course, you'll be confident in building modern React applications using hooks and functional components.`,
  trainer: 'Jane Smith',
  trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  trainerBio: 'Senior Frontend Developer with 8+ years of experience in React and modern JavaScript. Previously worked at major tech companies and passionate about teaching web development.',
  price: 50,
  duration: 90,
  scheduledAt: '2024-01-15T14:00:00Z',
  category: 'Programming',
  level: 'Beginner',
  rating: 4.8,
  enrolledStudents: 156,
  maxStudents: 200,
  tags: ['React', 'JavaScript', 'Hooks'],
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
  learningOutcomes: [
    'Understand the fundamentals of React Hooks',
    'Build functional components with state management',
    'Implement side effects in React applications',
    'Create custom hooks for reusable logic',
    'Optimize React components for performance',
    'Handle complex state management scenarios'
  ],
  prerequisites: [
    'Basic knowledge of JavaScript',
    'Familiarity with React basics',
    'Understanding of ES6+ features'
  ],
  syllabus: [
    {
      title: 'Introduction to React Hooks',
      duration: 15,
      topics: ['Overview of Hooks', 'Class vs Functional Components', 'Rules of Hooks']
    },
    {
      title: 'State Management with useState',
      duration: 20,
      topics: ['Basic State Management', 'Complex State Updates', 'State with Objects and Arrays']
    },
    {
      title: 'Effects and Lifecycle',
      duration: 25,
      topics: ['useEffect Hook', 'Cleanup Functions', 'Dependency Arrays']
    },
    {
      title: 'Advanced Hooks',
      duration: 30,
      topics: ['useContext', 'useReducer', 'useCallback', 'useMemo']
    }
  ],
  reviews: [
    {
      id: 1,
      user: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      rating: 5,
      comment: 'Excellent course! The concepts were explained clearly and the practical examples were very helpful.',
      date: '2024-01-10'
    },
    {
      id: 2,
      user: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      rating: 4,
      comment: 'Great content and well-structured. Would have loved more advanced examples.',
      date: '2024-01-08'
    }
  ]
};

export const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (id) {
        try {
          const data = await courseService.getCourseById(id);
          setCourse(data);
        } catch (error) {
          console.error('Error fetching course:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Hero Section */}
      <div className="relative h-[300px] -mt-6 -mx-6 mb-6">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <Badge className="mb-2">{course.category}</Badge>
          <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-white/90 line-clamp-2">{course.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="card-elevated">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                <p className="text-muted-foreground whitespace-pre-line">{course.longDescription}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index}>{prerequisite}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="syllabus" className="p-6">
              <div className="space-y-6">
                {course.syllabus.map((section, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge variant="secondary">{section.duration} min</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {section.topics.map((topic, topicIndex) => (
                          <li key={topicIndex}>{topic}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="instructor" className="p-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={course.trainerAvatar}
                      alt={course.trainer}
                      className="w-20 h-20 rounded-full"
                    />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{course.trainer}</h3>
                      <p className="text-muted-foreground">{course.trainerBio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold ml-2">{course.rating}</span>
                      <span className="text-muted-foreground ml-2">Course Rating</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={review.avatar}
                            alt={review.user}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{review.user}</h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <p className="mt-2 text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold mb-2">{course.price} UC</div>
              </div>

              <div className="space-y-4">
                <Button className="w-full btn-primary" size="lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    {course.duration} minutes
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-muted-foreground" />
                    {course.level}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    {course.enrolledStudents} enrolled
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    {new Date(course.scheduledAt).toLocaleDateString()}
                  </div>
                </div>

                <Progress value={(course.enrolledStudents / course.maxStudents) * 100} />
                <p className="text-sm text-center text-muted-foreground">
                  {course.maxStudents - course.enrolledStudents} spots remaining
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};