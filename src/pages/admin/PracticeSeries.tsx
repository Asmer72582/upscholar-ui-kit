import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Loader2, CheckCircle, XCircle, Eye, Mail, ExternalLink, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { practiceSeriesService } from '@/services/practiceSeriesService';
import { adminService } from '@/services/adminService';

export const AdminPracticeSeries: React.FC = () => {
  const [sheets, setSheets] = useState<any[]>([]);
  const [marksheets, setMarksheets] = useState<any[]>([]);
  const [freeAccessMarks, setFreeAccessMarks] = useState(80);
  const [answerKeyDurationDays, setAnswerKeyDurationDays] = useState(7);
  const [sheetMaxSizeMB, setSheetMaxSizeMB] = useState(20);
  const [marksheetMaxSizeMB, setMarksheetMaxSizeMB] = useState(10);
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>({});
  const [notifyLoading, setNotifyLoading] = useState<Record<string, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    loadPracticeSeriesSettings();
    setLoading(false);
  }, []);

  const handleUploadSheet = async () => {
    if (!uploadTitle || !uploadSubject || !uploadFile) {
      toast.error('Title, subject and PDF file required');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('subject', uploadSubject);
      formData.append('category', uploadCategory);
      formData.append('sheet', uploadFile);
      await practiceSeriesService.adminUploadSheet(formData);
      toast.success(`Practice sheet uploaded. Answer release in ${answerKeyDurationDays} days.`);
      setUploadTitle('');
      setUploadSubject('');
      setUploadCategory('');
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await practiceSeriesService.adminRejectMarksheet(id);
      toast.success('Marksheet rejected.');
      loadMarksheets();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this approved marksheet request? The student will lose free access and the request will be removed from the list.')) return;
    setDeleteLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await practiceSeriesService.adminDeleteMarksheet(id);
      toast.success('Marksheet request deleted.');
      loadMarksheets();
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
        <p className="text-muted-foreground">Upload practice sheets, approve marksheets.</p>
      </div>

      <Tabs defaultValue="sheets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sheets">Practice Sheets</TabsTrigger>
          <TabsTrigger value="marksheets">Marksheets</TabsTrigger>
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
                  <Input value={uploadSubject} onChange={(e) => setUploadSubject(e.target.value)} placeholder="e.g. Mathematics" />
                </div>
                <div>
                  <Label>Category (optional)</Label>
                  <Input value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} placeholder="e.g. JEE, NEET" />
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
                    <div key={s._id} className="flex items-center justify-between border rounded p-3">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-sm text-muted-foreground">{s.subject} · {s.category || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(s.uploadedAt).toLocaleDateString()} · Answers release {new Date(s.answerReleaseDate).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={s.sheetActive ? 'default' : 'secondary'}>{s.sheetActive ? 'Sheet active' : 'Sheet inactive'}</Badge>
                          <Badge variant={s.answersActive ? 'default' : 'secondary'}>{s.answersActive ? 'Answers active' : 'Answers inactive'}</Badge>
                        </div>
                      </div>
                      {s.pdfUrl && (
                        <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View</Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marksheets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Marksheets</CardTitle>
              <CardDescription>
                All marksheets that have been uploaded. Enter last year % and use Approve/Reject for pending items (approve if % ≥ {freeAccessMarks} for free access). Use &quot;Notify&quot; to send an email to the student.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marksheets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No uploaded marksheets yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Class · Board</TableHead>
                      <TableHead>Last year %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marksheets.map((m) => (
                      <TableRow key={m._id}>
                        <TableCell>
                          <span className="font-medium">{m.user?.name || m.fullName || '—'}</span>
                          {m.contactNumber && (
                            <p className="text-xs text-muted-foreground mt-0.5">{m.contactNumber}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <a href={`mailto:${m.user?.email || m.emailId || ''}`} className="text-primary hover:underline text-sm">
                            {m.user?.email || m.emailId || '—'}
                          </a>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.classGrade || '—'} · {m.educationBoard || '—'}
                        </TableCell>
                        <TableCell>
                          {m.lastExamPercentage != null ? (
                            <span className="font-medium">{m.lastExamPercentage}%</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(m.marksheetStatus || 'pending')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {m.marksheetUrl && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={m.marksheetUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" /> View
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNotify(m._id)}
                              disabled={!!notifyLoading[m._id]}
                            >
                              {notifyLoading[m._id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                              <span className="ml-1">Notify</span>
                            </Button>
                            {m.marksheetStatus === 'approved' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(m._id)}
                                disabled={!!deleteLoading[m._id]}
                              >
                                {deleteLoading[m._id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span className="ml-1">Delete</span>
                              </Button>
                            )}
                            {m.marksheetStatus === 'pending' && (
                              <>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="%"
                                  className="w-14 h-8 text-center"
                                  value={percentInputs[m._id] ?? ''}
                                  onChange={(e) => setPercentInputs((p) => ({ ...p, [m._id]: e.target.value }))}
                                />
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(m._id, parseFloat(percentInputs[m._id] || '0'))}
                                  className="gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" /> Approve/Reject
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleReject(m._id)} className="gap-1">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
