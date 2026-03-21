import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lectureService, Lecture } from '@/services/lectureService';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid, List, Clock, Users, Star, Calendar, BookOpen, PlayCircle, Eye, UserPlus, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLectureScheduleDisplay } from '@/lib/lectureScheduleDisplay';

/** Past / missed — browse card is informational only */
function isLectureMissedOnBrowseCard(lecture: Lecture): boolean {
  if (lecture.status === 'missed') return true;
  if (lecture.status === 'scheduled' && lecture.scheduledAt) {
    return new Date(lecture.scheduledAt) < new Date();
  }
  return false;
}

function isStudentEnrolledInLecture(lecture: Lecture, studentId: string | undefined): boolean {
  if (!studentId || !lecture.enrolledStudents?.length) return false;
  const sid = String(studentId).trim();
  return lecture.enrolledStudents.some((e) => {
    const eid = e.student?.id != null ? String(e.student.id).trim() : '';
    return eid.length > 0 && eid === sid;
  });
}

/** No enrollment seats left (virtual from API or derived from counts). */
function isLectureAtCapacity(lecture: Lecture): boolean {
  if (lecture.isFull) return true;
  const max = lecture.maxStudents;
  if (max == null || max <= 0) return false;
  return lecture.enrolledCount >= max;
}

type BrowseCta =
  | { kind: 'details'; label: string; title: string; Icon: typeof PlayCircle; path: 'details' }
  | { kind: 'spectator'; label: string; title: string; Icon: typeof Eye; path: 'details' }
  | { kind: 'enroll'; label: string; title: string; Icon: typeof UserPlus; path: 'details' }
  | { kind: 'join'; label: string; title: string; Icon: typeof Video; path: 'meeting' };

function getBrowseLectureCta(lecture: Lecture, user: User | null): BrowseCta {
  if (!user || user.role !== 'student') {
    const missed = isLectureMissedOnBrowseCard(lecture);
    if (!missed && lecture.status === 'scheduled' && isLectureAtCapacity(lecture)) {
      return {
        kind: 'spectator',
        label: 'View as Spectator',
        title: 'Lecture is full — open details for spectator options when live',
        Icon: Eye,
        path: 'details',
      };
    }
    return {
      kind: 'details',
      label: 'View details',
      title: 'Open lecture details',
      Icon: PlayCircle,
      path: 'details',
    };
  }
  const enrolled = isStudentEnrolledInLecture(lecture, user.id);
  const missed = isLectureMissedOnBrowseCard(lecture);

  if (missed) {
    return {
      kind: 'details',
      label: 'View details',
      title: 'Open lecture details (enrollment closed for past lectures)',
      Icon: PlayCircle,
      path: 'details',
    };
  }

  if (lecture.status === 'live') {
    if (enrolled) {
      return {
        kind: 'join',
        label: 'Join Now',
        title: 'Join live with full access (camera, mic, chat)',
        Icon: Video,
        path: 'meeting',
      };
    }
    return {
      kind: 'spectator',
      label: 'View as Spectator',
      title: 'Open lecture to watch live view-only (spectator)',
      Icon: Eye,
      path: 'details',
    };
  }

  // Upcoming scheduled
  if (enrolled) {
    return {
      kind: 'details',
      label: 'View details',
      title: 'You are enrolled — open for schedule and join when live',
      Icon: PlayCircle,
      path: 'details',
    };
  }

  if (isLectureAtCapacity(lecture)) {
    return {
      kind: 'spectator',
      label: 'View as Spectator',
      title: 'Lecture is full — open details to watch as spectator when live (view-only)',
      Icon: Eye,
      path: 'details',
    };
  }

  return {
    kind: 'enroll',
    label: 'Enroll',
    title: 'Open lecture to enroll and secure your spot',
    Icon: UserPlus,
    path: 'details',
  };
}

export const BrowseLectures: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
    const atCapacity = isLectureAtCapacity(lecture);
    const cta = getBrowseLectureCta(lecture, user);
    const CtaIcon = cta.Icon;
    /** Spectator actions use outline so they read differently from Enroll / Join */
    const spectatorOutline = cta.kind === 'spectator';

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

    const scheduled = getLectureScheduleDisplay(lecture.scheduledAt);

    return (
      <Card
        className={cn(
          'transition-all cursor-pointer hover:shadow-md border overflow-hidden flex flex-col',
          !isListView && 'h-full min-h-[320px]',
          getStatusColor(lecture.status),
          isListView && 'sm:min-h-0'
        )}
        onClick={() => navigate(`/student/lecture/${lecture.id}`)}
      >
        <CardHeader className={cn('shrink-0 space-y-0 pb-3', isListView && 'py-4')}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  {lecture.category}
                </Badge>
                <Badge
                  className={cn(
                    'text-xs shrink-0',
                    lecture.status === 'live' && 'bg-green-600 text-white',
                    lecture.status === 'scheduled' && 'bg-blue-600 text-white'
                  )}
                >
                  {lecture.status}
                </Badge>
                {atCapacity && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium border-amber-500/80 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-600 shrink-0"
                    title="No enrollment seats left — you can still watch as a spectator when the lecture is live"
                  >
                    Full
                  </Badge>
                )}
              </div>
              <CardTitle className={cn('text-base line-clamp-2 leading-snug pr-1', isListView && 'text-lg')}>
                {lecture.title}
              </CardTitle>
              <CardDescription className="text-xs mt-1.5 line-clamp-1">by {trainerName}</CardDescription>
            </div>
            <span className="text-sm font-semibold tabular-nums shrink-0 text-right leading-tight pt-0.5">
              {lecture.price} UC
            </span>
          </div>
        </CardHeader>

        <CardContent
          className={cn(
            'flex flex-1 flex-col pt-0 pb-5 px-6 min-h-0',
            isListView && 'sm:pb-6'
          )}
        >
          <p
            className="text-sm text-muted-foreground line-clamp-2 leading-snug mb-3 min-h-[2.625rem]"
            title={lecture.description || undefined}
          >
            {lecture.description?.trim() ? lecture.description : '—'}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground shrink-0 mb-1">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {lecture.duration} min
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Star className="w-3.5 h-3.5 shrink-0 fill-amber-400 text-amber-400" />
              {lecture.averageRating.toFixed(1)}
            </span>
            <span
              className="inline-flex items-center gap-1 whitespace-nowrap tabular-nums"
              title={atCapacity ? 'Capacity reached' : 'Enrolled / capacity'}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              {lecture.enrolledCount}/{lecture.maxStudents}
            </span>
          </div>

          <div className="mt-auto pt-4 border-t border-border/60 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground min-w-0">
              <span className="inline-flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground/90">{scheduled.text}</span>
              </span>
              {scheduled.badgeText && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal border-amber-300 text-amber-800 dark:border-amber-600 dark:text-amber-300 shrink-0"
                >
                  {scheduled.badgeText}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant={spectatorOutline ? 'outline' : 'default'}
              className={cn(
                'w-full h-10 sm:h-9 justify-center font-medium',
                cta.kind === 'join' && 'bg-red-600 hover:bg-red-700 animate-pulse border-0 text-white'
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (cta.path === 'meeting') {
                  navigate(`/meeting/${lecture.id}`);
                } else {
                  navigate(`/student/lecture/${lecture.id}`);
                }
              }}
              title={cta.title}
            >
              <CtaIcon className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">{cta.label}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Browse Lectures</h1>
        <p className="text-sm text-muted-foreground">
          Discover expert-led lectures. Cards show <strong>Enroll</strong> when seats are available, <strong>Full</strong> when enrollment is full, and <strong>View as Spectator</strong> if you cannot enroll (full or live without a seat). <strong>Join Now</strong> appears when you are enrolled and the lecture is live. Past lectures show <strong>View details</strong>.
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
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'
              : 'space-y-4'
          )}
        >
          {[...Array(6)].map((_, i) => (
            <Card key={i} className={cn('overflow-hidden', viewMode === 'grid' && 'min-h-[320px]')}>
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
          <section
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'
                : 'space-y-3'
            )}
          >
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
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'
                : 'space-y-3'
            )}
          >
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