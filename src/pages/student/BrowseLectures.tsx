import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('averageRating');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 0,
    total: 0,
    limit: 20
  });

  const categories = ['all', 'Programming', 'Design', 'Data Science', 'Marketing', 'Technology', 'Business', 'Science'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy: sortBy,
        sortOrder: 'desc' as const,
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
  }, [searchTerm, selectedCategory, selectedLevel, sortBy, pagination.current]);

  const filteredLectures = lectures;

  const LectureCard = ({ lecture, isListView = false }: { lecture: Lecture; isListView?: boolean }) => {
    const trainerName = `${lecture.trainer.firstname} ${lecture.trainer.lastname}`;
    const trainerAvatar = lecture.trainer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lecture.trainer.firstname}`;
    const thumbnail = `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&seed=${lecture.id}`;
    
    return (
      <Card 
        className={cn(
          "card-elevated overflow-hidden transition-all cursor-pointer hover:shadow-medium",
          isListView ? "flex flex-row" : ""
        )}
        onClick={() => navigate(`/student/lecture/${lecture.id}`)}    
      >
        <div className={cn("relative", isListView ? "w-48 flex-shrink-0" : "")}>
          <img 
            src={thumbnail} 
            alt={lecture.title}
            className={cn("object-cover", isListView ? "w-full h-full" : "w-full h-48")}
          />
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
            {lecture.price} UC
          </Badge>
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="text-xs">
              {lecture.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex-1">
          <CardHeader className={cn(isListView ? "pb-2" : "")}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge variant="outline" className="mb-2 text-xs">
                  {lecture.category}
                </Badge>
                <CardTitle className={cn("line-clamp-2", isListView ? "text-lg" : "")}>{lecture.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  by {trainerName}
                </CardDescription>
              </div>
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
              <div className="text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 inline mr-1" />
                {new Date(lecture.scheduledAt).toLocaleDateString()}
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
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="date">Date</SelectItem>
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