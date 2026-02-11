import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lectureService, Lecture } from '@/services/lectureService';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Clock, 
  Users, 
  Star,
  Calendar,
  BookOpen,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const BrowseLectures: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 0,
    total: 0,
    limit: 20
  });

  // Read search term from URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const categories = [
    'all',
    // Basic 10th Class Subjects
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Hindi',
    'Social Studies',
    'History',
    'Geography',
    'Civics',
    'Economics',
    // Additional Subjects
    'Computer Science',
    'Programming',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Accountancy',
    'Business Studies',
    'Commerce',
    'Arts & Crafts',
    'Music',
    'Competitive Exams',
    'Other'
  ];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const apiSortBy = sortBy === 'rating' ? 'averageRating' : sortBy === 'date' ? 'scheduledAt' : sortBy;
      const sortOrder = sortBy === 'price' || sortBy === 'date' ? 'asc' : 'desc';
      const filters = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy: apiSortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: pagination.current,
        limit: pagination.limit
      };

      const response = await lectureService.getAllLectures(filters);
      setLectures(response.lectures);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedLevel, sortBy, pagination.current]);

  // Filter out completed lectures from main feed
  const filteredLectures = lectures.filter(lecture => lecture.status !== 'completed');

  const LectureCard = ({ lecture, isListView = false }: { lecture: Lecture; isListView?: boolean }) => {
    const trainerName = `${lecture.trainer.firstname} ${lecture.trainer.lastname}`;
    const trainerAvatar = lecture.trainer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lecture.trainer.firstname}`;
    
    // Get status-based styling
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'live':
          return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
        case 'scheduled':
          return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
        default:
          return '';
      }
    };
    
    // Format scheduled time and "Ending in X days" indicator
    const formatScheduledTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: 'Ended', isPast: true };
      if (diffDays === 0) return { text: 'Ending today', isPast: false };
      if (diffDays === 1) return { text: 'Ending in 1 day', isPast: false };
      if (diffDays <= 14) return { text: `Ending in ${diffDays} days`, isPast: false };
      return { text: date.toLocaleDateString(), isPast: false };
    };
    
    return (
      <Card 
        className={cn(
          "card-elevated hover-lift transition-all cursor-pointer",
          getStatusColor(lecture.status),
          isListView ? "flex flex-row" : ""
        )}
        onClick={() => navigate(`/student/lecture/${lecture.id}`)}    
      >
        <div className="flex-1">
          <CardHeader className={cn(isListView ? "pb-2" : "")}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {lecture.category}
                  </Badge>
                  <Badge 
                    className={cn(
                      "text-xs",
                      lecture.status === 'live' && "bg-green-500 text-white",
                      lecture.status === 'scheduled' && "bg-blue-500 text-white"
                    )}
                  >
                    {lecture.status.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className={cn("line-clamp-2", isListView ? "text-lg" : "")}>{lecture.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  by {trainerName}
                </CardDescription>
              </div>
              <Badge className="bg-accent text-accent-foreground ml-2">
                {lecture.price} UC
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className={cn(isListView ? "pt-0" : "")}>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {lecture.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {lecture.duration} min
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {lecture.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {lecture.enrolledCount}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xs flex items-center">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  <span className={formatScheduledTime(lecture.scheduledAt).isPast ? 'text-muted-foreground' : ''}>
                    {formatScheduledTime(lecture.scheduledAt).text}
                  </span>
                </div>
                {!formatScheduledTime(lecture.scheduledAt).isPast && (() => {
                  const diffDays = Math.ceil((new Date(lecture.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return diffDays >= 1 && diffDays <= 14 ? (
                    <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                      {diffDays === 1 ? '1 day left' : `${diffDays} days left`}
                    </Badge>
                  ) : null;
                })()}
              </div>
              <Button 
                size="sm" 
                className="btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/student/lecture/${lecture.id}`);
                }}
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Browse Lectures</h1>
        <p className="text-muted-foreground">
          Discover and enroll in expert-led lectures across various topics
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search lectures, trainers, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest First</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="date">Lecture Date</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredLectures.length} lectures
        </p>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {searchTerm && `"${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {selectedLevel !== 'all' && ` • ${selectedLevel} level`}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="card-elevated overflow-hidden">
              <div className="w-full h-48 bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lectures Grid/List */}
      {!loading && (
        <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
        )}>
          {filteredLectures.map((lecture) => (
            <LectureCard 
              key={lecture.id} 
              lecture={lecture} 
              isListView={viewMode === 'list'} 
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
            disabled={pagination.current === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
            disabled={pagination.current === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {!loading && filteredLectures.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No lectures found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse different categories
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};