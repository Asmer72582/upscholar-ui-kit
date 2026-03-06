import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lectureService, Lecture } from '@/services/lectureService';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid, List, Clock, Users, Star, Calendar, BookOpen, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BrowseLectures: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
  }, [searchTerm, selectedCategory, sortBy, pagination.current]);

  // Split lectures: live/upcoming vs missed
  const now = new Date();
  const upcomingAndLiveLectures = lectures.filter((lecture) => {
    if (lecture.status === 'live') return true;
    if (lecture.status === 'scheduled' && lecture.scheduledAt) {
      return new Date(lecture.scheduledAt) >= now;
    }
    return false;
  });
  const missedLectures = lectures.filter(
    (lecture) =>
      (lecture.status === 'missed') ||
      (lecture.status === 'scheduled' &&
        lecture.scheduledAt &&
        new Date(lecture.scheduledAt) < now)
  );

  const LectureCard = ({ lecture, isListView = false }: { lecture: Lecture; isListView?: boolean }) => {
    const trainerName = `${lecture.trainer.firstname} ${lecture.trainer.lastname}`;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'live':
          return 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30';
        case 'scheduled':
          return 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30';
        default:
          return '';
      }
    };

    const formatScheduledTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return { text: 'Ended', isPast: true };
      if (diffDays === 0) return { text: 'Today', isPast: false };
      if (diffDays === 1) return { text: '1 day', isPast: false };
      if (diffDays <= 14) return { text: `${diffDays} days`, isPast: false };
      return { text: date.toLocaleDateString(), isPast: false };
    };

    const scheduled = formatScheduledTime(lecture.scheduledAt);
    const diffDays = Math.ceil((new Date(lecture.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const showDaysLeft = !scheduled.isPast && diffDays >= 1 && diffDays <= 14;

    return (
      <Card
        className={cn(
          "transition-all cursor-pointer hover:shadow-md border",
          getStatusColor(lecture.status),
          isListView && "flex flex-row"
        )}
        onClick={() => navigate(`/student/lecture/${lecture.id}`)}
      >
        <div className="flex-1">
          <CardHeader className={cn("pb-2", isListView && "py-4")}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {lecture.category}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-xs",
                      lecture.status === 'live' && "bg-green-600 text-white",
                      lecture.status === 'scheduled' && "bg-blue-600 text-white"
                    )}
                  >
                    {lecture.status}
                  </Badge>
                </div>
                <CardTitle className={cn("text-base line-clamp-2", isListView && "text-lg")}>
                  {lecture.title}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">by {trainerName}</CardDescription>
              </div>
              <span className="text-sm font-medium shrink-0">{lecture.price} UC</span>
            </div>
          </CardHeader>
          <CardContent className={cn("pt-0", isListView && "pt-0")}>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {lecture.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{lecture.duration} min</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{lecture.averageRating.toFixed(1)}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{lecture.enrolledCount}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span>{scheduled.text}</span>
                {showDaysLeft && (
                  <Badge variant="outline" className="text-xs font-normal border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400">
                    {diffDays === 1 ? '1 day left' : `${diffDays} left`}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="default"
                className="shrink-0"
                onClick={(e) => { e.stopPropagation(); navigate(`/student/lecture/${lecture.id}`); }}
              >
                <PlayCircle className="w-3.5 h-3.5 mr-1" />
                View
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Browse Lectures</h1>
        <p className="text-sm text-muted-foreground">
          Discover and enroll in expert-led lectures
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 border rounded-md p-1 w-fit">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {upcomingAndLiveLectures.length} lecture{upcomingAndLiveLectures.length !== 1 ? 's' : ''}
          {(searchTerm || selectedCategory !== 'all') && (
            <span className="ml-1">
              {searchTerm && ` · "${searchTerm}"`}
              {selectedCategory !== 'all' && ` · ${selectedCategory}`}
            </span>
          )}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        )}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-36 bg-muted/50 animate-pulse" />
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-1/3 mb-2" />
                <div className="h-5 bg-muted/50 rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-3 bg-muted/50 rounded animate-pulse w-full mb-2" />
                <div className="h-3 bg-muted/50 rounded animate-pulse w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lecture list */}
      {!loading && upcomingAndLiveLectures.length > 0 && (
        <>
          <section className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          )}>
            {upcomingAndLiveLectures.map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                isListView={viewMode === 'list'}
              />
            ))}
          </section>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                disabled={pagination.current === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                {pagination.current} / {pagination.pages}
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
        </>
      )}

      {/* Empty state */}
      {!loading && upcomingAndLiveLectures.length === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/30 py-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground mb-1">No lectures right now</p>
          <p className="text-sm text-muted-foreground mb-4">Try another search or category</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Missed lectures */}
      {!loading && missedLectures.length > 0 && (
        <section className="space-y-4 pt-6 border-t">
          <div>
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Missed
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Scheduled time has passed</p>
          </div>
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          )}>
            {missedLectures.map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                isListView={viewMode === "list"}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};