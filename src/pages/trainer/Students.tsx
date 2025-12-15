import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, MoreHorizontal, MessageCircle, Mail, Download, Filter, Users, BookOpen, Clock, Loader2, Send, X, RefreshCw, TrendingUp } from 'lucide-react';
import { trainerService } from '@/services/trainerService';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: Array<{
    lectureId: string;
    lectureTitle: string;
    status: string;
    scheduledAt: string;
    attended: boolean;
  }>;
  totalLectures: number;
  completedLectures: number;
  attendedLectures: number;
  progress: number;
  status: string;
  enrolledDate: string;
  lastActive: string;
}

interface CourseStats {
  course: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  completionRate: number;
}

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  const fetchStudentsData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsData, statsData] = await Promise.all([
        trainerService.getEnrolledStudents(),
        trainerService.getCourseStats()
      ]);
      setStudents(studentsData);
      setCourseStats(statsData);
    } catch (error) {
      console.error('Error fetching students data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  const handleOpenEmailModal = (student: Student) => {
    setSelectedStudent(student);
    setEmailSubject('');
    setEmailContent('');
    setEmailModalOpen(true);
  };

  const handleCloseEmailModal = () => {
    setEmailModalOpen(false);
    setSelectedStudent(null);
    setEmailSubject('');
    setEmailContent('');
  };

  const handleSendEmail = async () => {
    if (!selectedStudent) return;

    if (!emailSubject.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an email subject',
        variant: 'destructive',
      });
      return;
    }

    if (!emailContent.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter email content',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingEmail(true);
      await trainerService.sendEmailToStudent(
        selectedStudent.id,
        emailSubject,
        emailContent
      );

      toast({
        title: 'Email Sent Successfully',
        description: `Your email has been sent to ${selectedStudent.name}`,
      });

      handleCloseEmailModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while sending the email';
      toast({
        title: 'Failed to Send Email',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Get unique course titles for filtering
  const uniqueCourses = Array.from(new Set(
    students.flatMap(student => student.enrolledCourses.map(course => course.lectureTitle))
  ));

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || 
                         student.enrolledCourses.some(course => course.lectureTitle === selectedCourse);
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading students data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Students</h1>
          <p className="text-muted-foreground">Manage and track your students' progress</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStudentsData}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{students.filter(s => s.status === 'completed').length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">
                    {students.length > 0 
                      ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
                      : 0}%
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students">
          <TabsList>
            <TabsTrigger value="students">Student List</TabsTrigger>
            <TabsTrigger value="analytics">Course Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Students</CardTitle>
                    <CardDescription>Manage your enrolled students</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {uniqueCourses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Students Cards */}
                <div className="space-y-4">
                  {filteredStudents.length === 0 ? (
                    <Card className="card-elevated">
                      <CardContent className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          {searchTerm ? 'No matching students found' : 'No students found'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm 
                            ? `No students match "${searchTerm}". Try adjusting your search.`
                            : selectedCourse !== 'all' 
                            ? "No students enrolled in this course."
                            : selectedStatus !== 'all'
                            ? `No students with ${selectedStatus} status.`
                            : "You don't have any enrolled students yet."
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredStudents.map((student) => (
                        <Card key={student.id} className="card-elevated hover-lift">
                          <CardContent className="p-6">
                            {/* Student Header */}
                            <div className="flex items-center gap-4 mb-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={student.avatar} />
                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{student.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                              </div>
                              {getStatusBadge(student.status)}
                            </div>

                            {/* Course Info */}
                            <div className="space-y-3 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Enrolled Courses</span>
                                <span className="font-semibold">{student.enrolledCourses.length}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Completed Lectures</span>
                                <span className="font-semibold">{student.completedLectures}/{student.totalLectures}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Last Active</span>
                                <span className="font-semibold">{new Date(student.lastActive).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Overall Progress</span>
                                <span className="font-semibold">{student.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColor(student.progress)} transition-all duration-300`}
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Course List (if any) */}
                            {student.enrolledCourses.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Enrolled Courses:</p>
                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                  {student.enrolledCourses.slice(0, 3).map((course, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-muted rounded">
                                      <BookOpen className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{course.lectureTitle}</span>
                                      <Badge variant="outline" className="ml-auto text-xs">
                                        {course.status}
                                      </Badge>
                                    </div>
                                  ))}
                                  {student.enrolledCourses.length > 3 && (
                                    <p className="text-xs text-muted-foreground text-center">
                                      +{student.enrolledCourses.length - 3} more
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleOpenEmailModal(student)}
                              >
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6">
              {courseStats.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No course analytics available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                courseStats.map((course) => (
                  <Card key={course.course} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{course.course}</CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {course.totalStudents} {course.totalStudents === 1 ? 'Student' : 'Students'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Total Students</p>
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-2xl font-bold text-primary">{course.totalStudents}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Active Students</p>
                            <BookOpen className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-green-600">{course.activeStudents}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Avg Progress</p>
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold text-blue-600">{course.averageProgress}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${course.averageProgress}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="text-2xl font-bold text-purple-600">{course.completionRate}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-purple-600 h-1.5 rounded-full"
                              style={{ width: `${course.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Send Email to Student
            </DialogTitle>
            <DialogDescription>
              {selectedStudent && (
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedStudent.avatar} />
                    <AvatarFallback>{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{selectedStudent.name}</p>
                    <p className="text-sm">{selectedStudent.email}</p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                disabled={sendingEmail}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message *</Label>
              <Textarea
                id="content"
                placeholder="Write your message here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                disabled={sendingEmail}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {emailContent.length} characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseEmailModal}
              disabled={sendingEmail}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail || !emailSubject.trim() || !emailContent.trim()}
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};