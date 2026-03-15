import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText, Upload, Loader2, CheckCircle, XCircle, Eye, Mail, ExternalLink, Trash2, User, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { practiceSeriesService } from '@/services/practiceSeriesService';
import { adminService } from '@/services/adminService';

export const AdminPracticeSeries: React.FC = () => {
  const SUBJECT_OPTIONS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
    'History',
    'Geography',
    'Civics',
    'Economics',
    'Computer Science',
    'Programming',
    'Web Development',
    'Data Science',
    'Other',
  ];
  const CLASS_OPTIONS = ['8th', '9th', '10th', '11th', '12th', 'Other'];
  const [sheets, setSheets] = useState<any[]>([]);
  const [marksheets, setMarksheets] = useState<any[]>([]);
  const [freeAccessMarks, setFreeAccessMarks] = useState(80);
  const [answerKeyDurationDays, setAnswerKeyDurationDays] = useState(7);
  const [sheetMaxSizeMB, setSheetMaxSizeMB] = useState(20);
  const [marksheetMaxSizeMB, setMarksheetMaxSizeMB] = useState(10);
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>({});
  const [notifyLoading, setNotifyLoading] = useState<Record<string, boolean>>({});
  const [answerUploadLoading, setAnswerUploadLoading] = useState<Record<string, boolean>>({});
  const [displayAnswersLoading, setDisplayAnswersLoading] = useState<Record<string, boolean>>({});
  const [toggleLoading, setToggleLoading] = useState<Record<string, 'sheet' | 'answers' | undefined>>({});
  const [deleteSheetLoading, setDeleteSheetLoading] = useState<Record<string, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadClassGrade, setUploadClassGrade] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredEnrollments = React.useMemo(() => {
    if (!enrollmentSearch.trim()) return enrollments;
    const q = enrollmentSearch.trim().toLowerCase();
    return enrollments.filter((p) => {
      const name = (p.user?.name || p.fullName || '').toLowerCase();
      const email = (p.user?.email || p.emailId || '').toLowerCase();
      const contact = (p.contactNumber || p.user?.mobile || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      const classGrade = (p.classGrade || '').toLowerCase();
      const board = (p.educationBoard || '').toLowerCase();
      return name.includes(q) || email.includes(q) || contact.includes(q) || city.includes(q) || classGrade.includes(q) || board.includes(q);
    });
  }, [enrollments, enrollmentSearch]);

  const loadSheets = async () => {
    try {
      const res = await practiceSeriesService.adminGetSheets();
      setSheets(res.sheets || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
    }
  };

  const loadMarksheets = async () => {
    try {
      const res = await practiceSeriesService.adminGetMarksheets();
      setMarksheets(res.marksheets || []);
      if (res.freeAccessMarks != null) setFreeAccessMarks(res.freeAccessMarks);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
    }
  };

  const loadEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const res = await practiceSeriesService.adminGetEnrollments();
      setEnrollments(res.enrollments || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const loadPracticeSeriesSettings = async () => {
    try {
      const ps = await adminService.getPracticeSeriesSettings();
      setFreeAccessMarks(ps.freeAccessMarks);
      setAnswerKeyDurationDays(ps.answerKeyDurationDays);
      setSheetMaxSizeMB(ps.sheetMaxSizeMB);
      setMarksheetMaxSizeMB(ps.marksheetMaxSizeMB);
    } catch {
      // keep defaults
    }
  };

  useEffect(() => {
    loadSheets();
    loadMarksheets();
    loadEnrollments();
    loadPracticeSeriesSettings();
    setLoading(false);
  }, []);

  const handleUploadSheet = async () => {
    if (!uploadTitle || !uploadSubject || !uploadClassGrade || !uploadFile) {
      toast.error('Title, subject, class and PDF file required');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('subject', uploadSubject);
      formData.append('category', uploadCategory);
       formData.append('classGrade', uploadClassGrade);
      formData.append('sheet', uploadFile);
      await practiceSeriesService.adminUploadSheet(formData);
      toast.success(`Practice sheet uploaded. Answer release in ${answerKeyDurationDays} days.`);
      setUploadTitle('');
      setUploadSubject('');
      setUploadCategory('');
      setUploadClassGrade('');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadSheets();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id: string, lastExamPercentage: number) => {
    if (lastExamPercentage == null || lastExamPercentage < 0 || lastExamPercentage > 100) {
      toast.error('Enter valid percentage (0–100)');
      return;
    }
    try {
      await practiceSeriesService.adminApproveMarksheet(id, lastExamPercentage);
      const approved = lastExamPercentage >= freeAccessMarks;
      toast.success(approved ? 'Marksheet approved. Free access granted.' : 'Marksheet rejected (below threshold).');
      loadMarksheets();
      loadEnrollments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await practiceSeriesService.adminRejectMarksheet(id);
      toast.success('Marksheet rejected.');
      loadMarksheets();
      loadEnrollments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleUploadAnswer = async (sheetId: string, file: File) => {
    setAnswerUploadLoading((prev) => ({ ...prev, [sheetId]: true }));
    try {
      await practiceSeriesService.adminUploadAnswer(sheetId, file);
      toast.success('Answer key uploaded (PDF).');
      loadSheets();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to upload answer key');
    } finally {
      setAnswerUploadLoading((prev) => ({ ...prev, [sheetId]: false }));
    }
  };

  const handleDisplayAnswers = async (sheetId: string) => {
    setDisplayAnswersLoading((prev) => ({ ...prev, [sheetId]: true }));
    try {
      await practiceSeriesService.adminDisplayAnswers(sheetId);
      toast.success('Answer key is now visible to students. Question sheet hidden.');
      loadSheets();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to display answer key');
    } finally {
      setDisplayAnswersLoading((prev) => ({ ...prev, [sheetId]: false }));
    }
  };

  const handleToggle = async (sheetId: string, field: 'sheetActive' | 'answersActive', value: boolean) => {
    const key = field === 'sheetActive' ? 'sheet' : 'answers';
    setToggleLoading((prev) => ({ ...prev, [sheetId]: key }));
    try {
      await practiceSeriesService.adminUpdateSheetToggles(sheetId, { [field]: value });
      setSheets((prev) =>
        prev.map((s) => (s._id === sheetId ? { ...s, [field]: value } : s))
      );
      toast.success(field === 'sheetActive' ? (value ? 'Question paper is now active.' : 'Question paper is now inactive.') : (value ? 'Answer sheet is now active.' : 'Answer sheet is now inactive.'));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setToggleLoading((prev) => ({ ...prev, [sheetId]: undefined }));
    }
  };

  const handleDeleteSheet = async (sheetId: string, title: string) => {
    if (!window.confirm(`Delete practice sheet "${title}"? This cannot be undone.`)) return;
    setDeleteSheetLoading((prev) => ({ ...prev, [sheetId]: true }));
    try {
      await practiceSeriesService.adminDeleteSheet(sheetId);
      toast.success('Practice sheet deleted.');
      loadSheets();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete sheet');
    } finally {
      setDeleteSheetLoading((prev) => ({ ...prev, [sheetId]: false }));
    }
  };

  const handleNotify = async (id: string) => {
    setNotifyLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await practiceSeriesService.adminNotifyMarksheet(id);
      toast.success('Email notification sent to student.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send email');
    } finally {
      setNotifyLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveFreeAccess = async (id: string) => {
    if (!window.confirm('Revoke this student\'s free access? They will no longer be able to view test sheets until they upload a new marksheet (for review) or pay per subject. This action can be done anytime.')) return;
    setDeleteLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await practiceSeriesService.adminDeleteMarksheet(id);
      toast.success('Free access revoked. Student can no longer view test sheets until they re-apply or pay.');
      loadMarksheets();
      loadEnrollments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'removed':
        return <Badge variant="outline">Removed</Badge>;
      default:
        return <Badge variant="outline">{status || '—'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Practice Series Admin</h1>
        <p className="text-muted-foreground">Upload practice sheets and manage enrolled students & marksheets.</p>
      </div>

      <Tabs defaultValue="sheets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sheets">Practice Sheets</TabsTrigger>
          <TabsTrigger value="enrollments">Enrolled Students</TabsTrigger>
        </TabsList>

        <TabsContent value="sheets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Practice Sheet</CardTitle>
              <CardDescription>PDF only, max {sheetMaxSizeMB}MB. answerReleaseDate = uploadDate + {answerKeyDurationDays} days.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Mathematics Ch1" />
                </div>
                <div>
                  <Label>Subject *</Label>
                  <Select
                    value={uploadSubject || undefined}
                    onValueChange={(v) => setUploadSubject(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category (optional)</Label>
                  <Input value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} placeholder="e.g. JEE, NEET" />
                </div>
                <div>
                  <Label>Class/Grade *</Label>
                  <Select
                    value={uploadClassGrade || undefined}
                    onValueChange={(v) => setUploadClassGrade(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>PDF File * (max {sheetMaxSizeMB}MB)</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>
              </div>
              <Button onClick={handleUploadSheet} disabled={uploading} className="gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload Practice Sheet
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uploaded Sheets</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : sheets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No sheets yet.</p>
              ) : (
                <div className="space-y-3">
                  {sheets.map((s) => (
                    <div key={s._id} className="flex flex-col md:flex-row md:items-center justify-between border rounded p-3 gap-3">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {s.subject} · {s.category || '-'} · Class {s.classGrade || '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(s.uploadedAt).toLocaleDateString()} · Answers release {new Date(s.answerReleaseDate).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            {toggleLoading[s._id] === 'sheet' ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Switch
                                id={`sheet-${s._id}`}
                                checked={!!s.sheetActive}
                                onCheckedChange={(checked) => handleToggle(s._id, 'sheetActive', !!checked)}
                                disabled={!!toggleLoading[s._id]}
                              />
                            )}
                            <Label htmlFor={`sheet-${s._id}`} className="text-sm font-normal cursor-pointer">
                              Question paper {s.sheetActive ? 'active' : 'inactive'}
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            {toggleLoading[s._id] === 'answers' ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Switch
                                id={`answers-${s._id}`}
                                checked={!!s.answersActive}
                                onCheckedChange={(checked) => handleToggle(s._id, 'answersActive', !!checked)}
                                disabled={!!toggleLoading[s._id] || !s.answerPdfUrl}
                              />
                            )}
                            <Label htmlFor={`answers-${s._id}`} className="text-sm font-normal cursor-pointer">
                              Answer sheet {s.answersActive ? 'active' : 'inactive'}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-wrap justify-end gap-2">
                          {s.pdfUrl && (
                            <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View question PDF</Button>
                            </a>
                          )}
                          {s.answerPdfUrl && (
                            <a href={s.answerPdfUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View answer PDF</Button>
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <label className="inline-flex items-center">
                            <Input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadAnswer(s._id, file);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={!!answerUploadLoading[s._id]}
                              onClick={(e) => {
                                const input = (e.currentTarget.previousSibling as HTMLInputElement | null);
                                if (input) input.click();
                              }}
                            >
                              {answerUploadLoading[s._id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-1" />
                              )}
                              Answer key
                            </Button>
                          </label>
                          {s.answerPdfUrl && !s.answersActive && (
                            <Button
                              size="sm"
                              variant="default"
                              disabled={!!displayAnswersLoading[s._id]}
                              onClick={() => handleDisplayAnswers(s._id)}
                            >
                              {displayAnswersLoading[s._id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Display answer key'
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!!deleteSheetLoading[s._id]}
                            onClick={() => handleDeleteSheet(s._id, s.title)}
                          >
                            {deleteSheetLoading[s._id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students & Marksheets</CardTitle>
              <CardDescription>All students who have enrolled for Practice Series, along with their marksheet and access status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, contact, city, class..."
                    value={enrollmentSearch}
                    onChange={(e) => setEnrollmentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {filteredEnrollments.length} of {enrollments.length} student{enrollments.length !== 1 ? 's' : ''}
                </p>
              </div>
              {enrollmentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No students have enrolled yet.</p>
                </div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No students match your search.</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => setEnrollmentSearch('')}>Clear search</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Class · Board</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Marksheet</TableHead>
                      <TableHead>Last year %</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>
                          <span className="font-medium">{p.user?.name || p.fullName || '—'}</span>
                          {p.contactNumber && (
                            <p className="text-xs text-muted-foreground mt-0.5">{p.contactNumber}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${p.user?.email || p.emailId || ''}`}
                            className="text-primary hover:underline text-sm"
                          >
                            {p.user?.email || p.emailId || '—'}
                          </a>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.classGrade || '—'} · {p.educationBoard || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.city || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {p.marksheetStatus
                              ? getStatusBadge(p.marksheetStatus)
                              : <Badge variant="outline">Not uploaded</Badge>}
                            {p.marksheetUrl && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={p.marksheetUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" /> View
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {p.lastExamPercentage != null ? (
                            <span className="font-medium">{p.lastExamPercentage}%</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {Array.isArray(p.accessibleSubjects) && p.accessibleSubjects.length > 0
                            ? p.accessibleSubjects.join(', ')
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedEnrollment(p)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View details
                            </Button>
                            {p.marksheetUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleNotify(p._id)}
                                disabled={!!notifyLoading[p._id]}
                              >
                                {notifyLoading[p._id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                <span className="ml-1">Notify</span>
                              </Button>
                            )}
                            {(p.marksheetStatus === 'approved' || (Array.isArray(p.accessibleSubjects) && p.accessibleSubjects.includes('All'))) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveFreeAccess(p._id)}
                                disabled={!!deleteLoading[p._id]}
                                title="Revoke free access anytime. Student will lose access to test sheets."
                              >
                                {deleteLoading[p._id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span className="ml-1">Remove free access</span>
                              </Button>
                            )}
                            {p.marksheetStatus === 'pending' && (
                              <>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="%"
                                  className="w-16 h-8 text-center"
                                  value={percentInputs[p._id] ?? ''}
                                  onChange={(e) => setPercentInputs((prev) => ({ ...prev, [p._id]: e.target.value }))}
                                />
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(p._id, parseFloat(percentInputs[p._id] || '0'))}
                                  className="gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" /> Approve/Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(p._id)}
                                  className="gap-1"
                                >
                                  <XCircle className="h-4 w-4" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Dialog open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Student details</DialogTitle>
              </DialogHeader>
              {selectedEnrollment && (
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-2">Profile</h4>
                    <dl className="grid grid-cols-1 gap-1.5">
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{selectedEnrollment.user?.name || selectedEnrollment.fullName || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Email</dt><dd><a href={`mailto:${selectedEnrollment.user?.email || selectedEnrollment.emailId}`} className="text-primary hover:underline">{selectedEnrollment.user?.email || selectedEnrollment.emailId || '—'}</a></dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Contact</dt><dd>{selectedEnrollment.contactNumber || selectedEnrollment.user?.mobile || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Class</dt><dd>{selectedEnrollment.classGrade || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Board</dt><dd>{selectedEnrollment.educationBoard || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Stream</dt><dd>{selectedEnrollment.streamOpted || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Exam prep</dt><dd>{selectedEnrollment.courseExamPrep || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">School / College</dt><dd className="truncate" title={selectedEnrollment.schoolCollegeName}>{selectedEnrollment.schoolCollegeName || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">City</dt><dd>{selectedEnrollment.city || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Pincode</dt><dd>{selectedEnrollment.pincode || '—'}</dd></div>
                      <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Address</dt><dd className="text-right truncate max-w-[200px]" title={selectedEnrollment.residentialAddress}>{selectedEnrollment.residentialAddress || '—'}</dd></div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-2">Marksheet & access</h4>
                    <dl className="grid grid-cols-1 gap-1.5">
                      <div className="flex justify-between gap-2 items-center"><dt className="text-muted-foreground">Marksheet status</dt><dd>{selectedEnrollment.marksheetStatus ? getStatusBadge(selectedEnrollment.marksheetStatus) : <Badge variant="outline">Not uploaded</Badge>}</dd></div>
                      {selectedEnrollment.lastExamPercentage != null && (
                        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Last year %</dt><dd className="font-medium">{selectedEnrollment.lastExamPercentage}%</dd></div>
                      )}
                      {selectedEnrollment.marksheetRejectionReason && (
                        <div className="col-span-2"><dt className="text-muted-foreground mb-1 block">Rejection reason</dt><dd className="text-muted-foreground">{selectedEnrollment.marksheetRejectionReason}</dd></div>
                      )}
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Accessible subjects</dt>
                        <dd className="font-medium">{Array.isArray(selectedEnrollment.accessibleSubjects) ? selectedEnrollment.accessibleSubjects.length : 0} subject{(Array.isArray(selectedEnrollment.accessibleSubjects) ? selectedEnrollment.accessibleSubjects.length : 0) !== 1 ? 's' : ''}</dd>
                      </div>
                      {Array.isArray(selectedEnrollment.accessibleSubjects) && selectedEnrollment.accessibleSubjects.length > 0 && (
                        <div className="col-span-2">
                          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                            {selectedEnrollment.accessibleSubjects.map((sub: string, i: number) => (
                              <li key={i}>{sub}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Enrolled {selectedEnrollment.createdAt ? new Date(selectedEnrollment.createdAt).toLocaleString() : '—'}
                    {selectedEnrollment.updatedAt && ` · Updated ${new Date(selectedEnrollment.updatedAt).toLocaleString()}`}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};
