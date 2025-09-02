import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const mockLectures = [
  {
    id: 'lecture-1',
    title: 'Introduction to React Hooks',
    description: 'Master the fundamentals of React Hooks and learn how to build modern, functional components.',
    scheduledAt: '2024-01-15T14:00:00Z',
    duration: 90,
    maxStudents: 25,
    enrolledStudents: 18,
    price: 50,
    status: 'scheduled',
    category: 'Programming',
    tags: ['React', 'JavaScript', 'Hooks'],
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'lecture-2',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript patterns, generics, and best practices.',
    scheduledAt: '2024-01-16T16:00:00Z',
    duration: 120,
    maxStudents: 20,
    enrolledStudents: 15,
    price: 75,
    status: 'scheduled',
    category: 'Programming',
    tags: ['TypeScript', 'JavaScript', 'Advanced'],
    createdAt: '2024-01-12T15:30:00Z',
  },
  {
    id: 'lecture-3',
    title: 'CSS Grid Mastery Workshop',
    description: 'Complete guide to CSS Grid layout system with practical examples.',
    scheduledAt: '2024-01-08T14:00:00Z',
    duration: 75,
    maxStudents: 30,
    enrolledStudents: 28,
    price: 40,
    status: 'completed',
    category: 'Web Design',
    tags: ['CSS', 'Layout', 'Grid'],
    createdAt: '2024-01-03T12:00:00Z',
    completedAt: '2024-01-08T15:15:00Z',
  },
  {
    id: 'lecture-4',
    title: 'JavaScript Fundamentals',
    description: 'Essential JavaScript concepts for beginners.',
    scheduledAt: '2024-01-10T10:00:00Z',
    duration: 90,
    maxStudents: 35,
    enrolledStudents: 32,
    price: 45,
    status: 'completed',
    category: 'Programming',
    tags: ['JavaScript', 'Basics'],
    createdAt: '2024-01-05T09:00:00Z',
    completedAt: '2024-01-10T11:30:00Z',
  },
  {
    id: 'lecture-5',
    title: 'React Performance Optimization',
    description: 'Learn how to optimize React applications for better performance.',
    scheduledAt: '2024-01-05T16:00:00Z',
    duration: 105,
    maxStudents: 20,
    enrolledStudents: 8,
    price: 65,
    status: 'cancelled',
    category: 'Programming',
    tags: ['React', 'Performance'],
    createdAt: '2024-01-01T10:00:00Z',
    cancelledAt: '2024-01-04T14:00:00Z',
    cancelReason: 'Insufficient enrollment',
  },
  {
    id: 'lecture-6',
    title: 'Modern Web Development Tools',
    description: 'Overview of essential tools for modern web development.',
    scheduledAt: '2024-01-20T11:00:00Z',
    duration: 80,
    maxStudents: 25,
    enrolledStudents: 0,
    price: 35,
    status: 'draft',
    category: 'Technology',
    tags: ['Tools', 'Workflow'],
    createdAt: '2024-01-14T16:30:00Z',
  },
];

export const ManageLectures: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'draft':
        return <Edit className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-primary bg-primary/10';
      case 'completed':
        return 'text-success bg-success/10';
      case 'cancelled':
        return 'text-destructive bg-destructive/10';
      case 'draft':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const filteredLectures = mockLectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecture.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 'all') return matchesSearch;
    return lecture.status === selectedTab && matchesSearch;
  });

  const stats = {
    total: mockLectures.length,
    scheduled: mockLectures.filter(l => l.status === 'scheduled').length,
    completed: mockLectures.filter(l => l.status === 'completed').length,
    draft: mockLectures.filter(l => l.status === 'draft').length,
    cancelled: mockLectures.filter(l => l.status === 'cancelled').length,
  };

  const LectureCard = ({ lecture }: { lecture: any }) => (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={cn("text-xs", getStatusColor(lecture.status))}>
                {getStatusIcon(lecture.status)}
                <span className="ml-1 capitalize">{lecture.status}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {lecture.category}
              </Badge>
            </div>
            <CardTitle className="line-clamp-2">{lecture.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {lecture.description}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Lecture
              </DropdownMenuItem>
              {lecture.status === 'draft' && (
                <DropdownMenuItem>
                  <Calendar className="w-4 h-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              {lecture.status === 'scheduled' && (
                <DropdownMenuItem className="text-destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(lecture.scheduledAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {lecture.duration} min
              </div>
            </div>
            <div className="font-medium text-primary">
              {lecture.price} UC
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Enrollment</span>
              <span className="font-medium">
                {lecture.enrolledStudents}/{lecture.maxStudents}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all",
                  lecture.enrolledStudents / lecture.maxStudents > 0.8 
                    ? "bg-success" 
                    : lecture.enrolledStudents / lecture.maxStudents > 0.5 
                    ? "bg-warning" 
                    : "bg-primary"
                )} 
                style={{ width: `${(lecture.enrolledStudents / lecture.maxStudents) * 100}%` }}
              />
            </div>
          </div>

          {lecture.tags && lecture.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lecture.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            {lecture.status === 'scheduled' && (
              <>
                <Button size="sm" variant="outline" className="flex-1">
                  <Users className="w-4 h-4 mr-1" />
                  View Students
                </Button>
                <Button size="sm" className="flex-1 btn-primary">
                  <Calendar className="w-4 h-4 mr-1" />
                  Start Live
                </Button>
              </>
            )}
            
            {lecture.status === 'draft' && (
              <>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" className="flex-1 btn-primary">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Publish
                </Button>
              </>
            )}

            {lecture.status === 'completed' && (
              <Button size="sm" variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-1" />
                View Analytics
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Lectures</h1>
          <p className="text-muted-foreground">
            Organize and track all your lectures
          </p>
        </div>
        <Button asChild className="btn-primary">
          <Link to="/trainer/schedule-lecture">
            <Plus className="w-4 h-4 mr-2" />
            New Lecture
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="card-elevated">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search lectures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lectures Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({stats.scheduled})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
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
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No {selectedTab === 'all' ? '' : selectedTab} lectures found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search criteria"
                    : "Start by creating your first lecture"
                  }
                </p>
                {!searchTerm && (
                  <Button asChild className="btn-primary">
                    <Link to="/trainer/schedule-lecture">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Lecture
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};