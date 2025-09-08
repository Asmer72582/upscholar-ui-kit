import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Lecture {
  id: string;
  title: string;
  description: string;
  trainer: string;
  trainerAvatar: string;
  price: number;
  duration: number;
  scheduledAt: string;
  category: string;
  level: string;
  rating: number;
  enrolledStudents: number;
  maxStudents: number;
  tags: string[];
  thumbnail: string;
}
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

const mockLectures: Lecture[] = [
  {
    id: 'lecture-1',
    title: 'Introduction to React Hooks',
    description: 'Master the fundamentals of React Hooks and learn how to build modern, functional components with state management.',
    trainer: 'Jane Smith',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    price: 50,
    duration: 90,
    scheduledAt: '2024-01-15T14:00:00Z',
    category: 'Programming',
    level: 'Beginner',
    rating: 4.8,
    enrolledStudents: 156,
    maxStudents: 200,
    tags: ['React', 'JavaScript', 'Hooks'],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-2',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript patterns, generics, and best practices for enterprise applications.',
    trainer: 'Mike Johnson',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    price: 75,
    duration: 120,
    scheduledAt: '2024-01-16T16:00:00Z',
    category: 'Programming',
    level: 'Advanced',
    rating: 4.9,
    enrolledStudents: 89,
    maxStudents: 150,
    tags: ['TypeScript', 'JavaScript', 'Advanced'],
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-3',
    title: 'UI/UX Design Principles',
    description: 'Learn fundamental design principles and create beautiful, user-friendly interfaces.',
    trainer: 'Sarah Wilson',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    price: 60,
    duration: 105,
    scheduledAt: '2024-01-17T10:00:00Z',
    category: 'Design',
    level: 'Intermediate',
    rating: 4.7,
    enrolledStudents: 203,
    maxStudents: 250,
    tags: ['UI', 'UX', 'Design'],
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-4',
    title: 'Data Science with Python',
    description: 'Introduction to data analysis, visualization, and machine learning using Python.',
    trainer: 'Dr. Emily Chen',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    price: 85,
    duration: 150,
    scheduledAt: '2024-01-18T14:30:00Z',
    category: 'Data Science',
    level: 'Intermediate',
    rating: 4.6,
    enrolledStudents: 134,
    maxStudents: 180,
    tags: ['Python', 'Data Science', 'ML'],
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-5',
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive guide to digital marketing, SEO, social media, and conversion optimization.',
    trainer: 'Alex Rodriguez',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    price: 55,
    duration: 90,
    scheduledAt: '2024-01-19T11:00:00Z',
    category: 'Marketing',
    level: 'Beginner',
    rating: 4.5,
    enrolledStudents: 287,
    maxStudents: 300,
    tags: ['Marketing', 'SEO', 'Social Media'],
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-6',
    title: 'Blockchain Fundamentals',
    description: 'Understanding blockchain technology, cryptocurrencies, and decentralized applications.',
    trainer: 'James Park',
    trainerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    price: 90,
    duration: 135,
    scheduledAt: '2024-01-20T15:00:00Z',
    category: 'Technology',
    level: 'Intermediate',
    rating: 4.8,
    enrolledStudents: 112,
    maxStudents: 160,
    tags: ['Blockchain', 'Crypto', 'Web3'],
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
  },
];

export const BrowseLectures: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating');

  const categories = ['all', 'Programming', 'Design', 'Data Science', 'Marketing', 'Technology'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredLectures = mockLectures
    .filter(lecture => {
      const matchesSearch = lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lecture.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lecture.trainer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || lecture.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || lecture.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'date':
          return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        default:
          return 0;
      }
    });

  const LectureCard = ({ lecture, isListView = false }: { lecture: Lecture; isListView?: boolean }) => (
    <Card 
      className={cn(
        "card-elevated overflow-hidden transition-all cursor-pointer hover:shadow-medium",
        isListView ? "flex flex-row" : ""
      )}
      onClick={() => navigate(`/course/${lecture.id}`)}    
    >
      <div className={cn("relative", isListView ? "w-48 flex-shrink-0" : "")}>
        <img 
          src={lecture.thumbnail} 
          alt={lecture.title}
          className={cn("object-cover", isListView ? "w-full h-full" : "w-full h-48")}
        />
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
          {lecture.price} UC
        </Badge>
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="text-xs">
            {lecture.level}
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
                by {lecture.trainer}
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
                {lecture.rating}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {lecture.enrolledStudents}
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
                navigate(`/course/${lecture.id}`);
              }}
            >
              <PlayCircle className="w-4 h-4 mr-1" />
              View Course
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );

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

      {/* Lectures Grid/List */}
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

      {filteredLectures.length === 0 && (
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