import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Upload, Loader2, Mail, Smartphone, Search, LayoutGrid, List, ChevronLeft, ChevronRight, X, User, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { practiceSeriesService } from '@/services/practiceSeriesService';
import { useAuth } from '@/contexts/AuthContext';

const CLASS_OPTIONS = ['8th', '9th', '10th', '11th', '12th', 'Other'];
const BOARD_OPTIONS = ['SSC', 'CBSE', 'ICSE', 'Other'];
const STREAM_OPTIONS = ['Science', 'Commerce'];
const EXAM_OPTIONS = ['JEE', 'NEET', 'Other'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground shrink-0 w-24">{label}</dt>
      <dd className="min-w-0 break-words">{value || '—'}</dd>
    </div>
  );
}

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      handler: (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
    }) => { open: () => void };
  }
}

export const PracticeSeries: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sheets, setSheets] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState<{ subjects: string[]; categories: string[] }>({ subjects: [], categories: [] });
  const [subjectFilter, setSubjectFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'subject' | 'subject-desc'>('newest');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [marksheetFile, setMarksheetFile] = useState<File | null>(null);
  const [marksheetLoading, setMarksheetLoading] = useState(false);
  const [marksheetRemoveLoading, setMarksheetRemoveLoading] = useState(false);
  const [freeAccessMarks, setFreeAccessMarks] = useState(80);
  const [marksheetMaxSizeMB, setMarksheetMaxSizeMB] = useState(10);
  const [pricePerSubject, setPricePerSubject] = useState(1999);
  const [notEligibleForFreeAccess, setNotEligibleForFreeAccess] = useState(false);
  const [paySubject, setPaySubject] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [marksheetInfo, setMarksheetInfo] = useState<{
    marksheetUrl: string | null;
    marksheetStatus: string | null;
    marksheetRejectionReason: string | null;
  }>({ marksheetUrl: null, marksheetStatus: null, marksheetRejectionReason: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [needsEnrollment, setNeedsEnrollment] = useState(false);
  const [enrollStep, setEnrollStep] = useState<'form' | 'otp'>('form');
  const [enrollForm, setEnrollForm] = useState({
    dateOfBirth: '',
    gender: '',
    residentialAddress: '',
    city: '',
    pincode: '',
    contactNumber: '',
    classGrade: '',
    educationBoard: '',
    streamOpted: '',
    courseExamPrep: '',
    schoolCollegeName: '',
  });
  const [enrollMarksheetFile, setEnrollMarksheetFile] = useState<File | null>(null);
  const enrollMarksheetInputRef = useRef<HTMLInputElement>(null);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sheets');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<{
    fullName: string;
    dateOfBirth: string;
    gender: string;
    residentialAddress: string;
    city: string;
    pincode: string;
    contactNumber: string;
    emailId: string;
    classGrade: string;
    educationBoard: string;
    streamOpted: string;
    courseExamPrep: string;
    schoolCollegeName: string;
    emailOtpVerified: boolean;
    phoneOtpVerified: boolean;
    lastExamPercentage?: number;
    marksheetStatus?: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadSheets = async (
    pageNum = 1,
    applyFilters = true,
    overrides?: { subject?: string; category?: string; search?: string; sort?: typeof sortBy }
  ) => {
    setLoading(true);
    setNeedsEnrollment(false);
    try {
      const params: Parameters<typeof practiceSeriesService.getSheets>[0] = {
        page: pageNum,
        limit: 12,
      };
      if (applyFilters) {
        params.subject = (overrides?.subject !== undefined ? overrides.subject : subjectFilter) || undefined;
        params.category = (overrides?.category !== undefined ? overrides.category : categoryFilter) || undefined;
        params.search = (overrides?.search !== undefined ? overrides.search : searchQuery).trim() || undefined;
        params.sort = overrides?.sort ?? sortBy;
      }
      const res = await practiceSeriesService.getSheets(params);
      setSheets(res.sheets || []);
      setHasAccess(res.hasAccess ?? false);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 0);
      setPage(res.page ?? 1);
      if (res.marksheetUrl !== undefined || res.marksheetStatus !== undefined) {
        setMarksheetInfo({
          marksheetUrl: res.marksheetUrl ?? null,
          marksheetStatus: res.marksheetStatus ?? null,
          marksheetRejectionReason: res.marksheetRejectionReason ?? null,
        });
      }
      if (res.freeAccessMarks != null) setFreeAccessMarks(res.freeAccessMarks);
      if (res.marksheetMaxSizeMB != null) setMarksheetMaxSizeMB(res.marksheetMaxSizeMB);
      if (res.pricePerSubject != null) setPricePerSubject(res.pricePerSubject);
      if (res.notEligibleForFreeAccess != null) setNotEligibleForFreeAccess(res.notEligibleForFreeAccess);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load sheets';
      toast.error(msg);
      if (msg.includes('profile required') || msg.includes('Complete registration first')) {
        setNeedsEnrollment(true);
      }
      setSheets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const opts = await practiceSeriesService.getSheetFilterOptions();
      setFilterOptions(opts);
    } catch {
      setFilterOptions({ subjects: [], categories: [] });
    }
  };

  useEffect(() => {
    loadSheets(1, false);
    loadFilterOptions();
  }, []);

  const applyFilters = () => {
    setSearchQuery(searchInput);
    setPage(1);
    loadSheets(1, true, { search: searchInput });
  };

  const clearFilters = () => {
    setSubjectFilter('');
    setCategoryFilter('');
    setSearchQuery('');
    setSearchInput('');
    setSortBy('newest');
    setPage(1);
    setLoading(true);
    practiceSeriesService.getSheets({ page: 1, limit: 12, sort: 'newest' }).then((res) => {
      setSheets(res.sheets || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 0);
      setPage(1);
    }).catch(() => setSheets([])).finally(() => setLoading(false));
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    loadSheets(p, true);
  };

  useEffect(() => {
    if (user && (user as { mobile?: string }).mobile && !enrollForm.contactNumber) {
      setEnrollForm((f) => ({ ...f, contactNumber: (user as { mobile?: string }).mobile || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (profileOpen && !profileData && !profileLoading) {
      setProfileLoading(true);
      practiceSeriesService.getProfile()
        .then((res) => { setProfileData(res.profile); })
        .catch(() => toast.error('Failed to load profile'))
        .finally(() => setProfileLoading(false));
    }
    if (!profileOpen) setProfileData(null);
  }, [profileOpen, profileData, profileLoading]);

  const handleUploadMarksheet = async () => {
    if (!marksheetFile) {
      toast.error('Select a file first');
      return;
    }
    setMarksheetLoading(true);
    try {
      await practiceSeriesService.uploadMarksheet(marksheetFile);
      toast.success('Marksheet uploaded. Awaiting admin approval.');
      setMarksheetFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMarksheetInfo({ marksheetUrl: null, marksheetStatus: 'pending', marksheetRejectionReason: null });
      loadSheets(1, false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setMarksheetLoading(false);
    }
  };

  const handleRemoveMarksheet = async () => {
    setMarksheetRemoveLoading(true);
    try {
      await practiceSeriesService.removeMarksheet();
      toast.success('Marksheet removed. You can upload a new one.');
      setMarksheetInfo({ marksheetUrl: null, marksheetStatus: 'removed', marksheetRejectionReason: null });
      loadSheets(1, false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove');
    } finally {
      setMarksheetRemoveLoading(false);
    }
  };

  const handlePayForSubject = async () => {
    if (!paySubject) {
      toast.error('Select a subject');
      return;
    }
    setPaymentLoading(true);
    try {
      const { orderId, keyId } = await practiceSeriesService.createOrder(paySubject);
      if (!window.Razorpay || !orderId || !keyId) {
        toast.error('Payment setup failed');
        return;
      }
      const options = {
        key: keyId,
        amount: (pricePerSubject * 100).toString(),
        currency: 'INR',
        order_id: orderId,
        handler: async (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await practiceSeriesService.verifyPayment({
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              subject: paySubject,
            });
            toast.success('Payment successful. You now have access.');
            setPaySubject('');
            loadSheets(1, false);
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Verification failed');
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to start payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const contactNumber = enrollForm.contactNumber || (user as { mobile?: string })?.mobile || '';

  const handleSendOtp = async () => {
    if (!contactNumber || contactNumber.length < 4) {
      toast.error('Please enter a valid contact number (at least 4 digits)');
      return;
    }
    setSendingOtp(true);
    try {
      await practiceSeriesService.sendOtp(contactNumber);
      toast.success('OTP sent to your email and phone');
      setEnrollStep('otp');
      setEmailOtp('');
      setPhoneOtp('');
      setEmailVerified(false);
      setPhoneVerified(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      await practiceSeriesService.verifyEmailOtp(contactNumber, emailOtp);
      setEmailVerified(true);
      toast.success('Email verified');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyPhone = async () => {
    setVerifying(true);
    try {
      await practiceSeriesService.verifyPhoneOtp(contactNumber, phoneOtp);
      setPhoneVerified(true);
      toast.success('Phone verified');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleEnroll = async () => {
    if (!emailVerified || !phoneVerified) {
      toast.error('Verify both email and phone OTP first');
      return;
    }
    if (!enrollMarksheetFile) {
      toast.error('Please upload last year\'s result (marksheet)');
      return;
    }
    setEnrollLoading(true);
    try {
      const formData = new FormData();
      Object.entries(enrollForm).forEach(([k, v]) => formData.append(k, String(v ?? '')));
      formData.append('marksheet', enrollMarksheetFile);
      await practiceSeriesService.enroll(formData);
      toast.success('Enrolled in Practice Series. Marksheet is under review.');
      setNeedsEnrollment(false);
      setEnrollMarksheetFile(null);
      if (enrollMarksheetInputRef.current) enrollMarksheetInputRef.current.value = '';
      loadSheets();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Enrollment failed');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (needsEnrollment) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enroll in Practice Series</h1>
          <p className="text-muted-foreground">Dual verify your email and phone, then add academic details. Uses your logged-in account.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>
              Name: {user?.name || user?.email} · Email: {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollStep === 'form' ? (
              <>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Contact Number *</Label>
                      <Input
                        value={enrollForm.contactNumber}
                        onChange={(e) => setEnrollForm((f) => ({ ...f, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 20) }))}
                        placeholder="Contact number"
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={enrollForm.dateOfBirth}
                        onChange={(e) => setEnrollForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gender *</Label>
                      <Select value={enrollForm.gender} onValueChange={(v) => setEnrollForm((f) => ({ ...f, gender: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Class/Grade *</Label>
                      <Select value={enrollForm.classGrade} onValueChange={(v) => setEnrollForm((f) => ({ ...f, classGrade: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {CLASS_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>City *</Label>
                      <Input value={enrollForm.city} onChange={(e) => setEnrollForm((f) => ({ ...f, city: e.target.value }))} placeholder="City" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pincode *</Label>
                      <Input
                        value={enrollForm.pincode}
                        onChange={(e) => setEnrollForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        placeholder="6 digits"
                        maxLength={6}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Education Board *</Label>
                      <Select value={enrollForm.educationBoard} onValueChange={(v) => setEnrollForm((f) => ({ ...f, educationBoard: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {BOARD_OPTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Stream *</Label>
                      <Select value={enrollForm.streamOpted} onValueChange={(v) => setEnrollForm((f) => ({ ...f, streamOpted: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {STREAM_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Course/Exam Prep *</Label>
                      <Select value={enrollForm.courseExamPrep} onValueChange={(v) => setEnrollForm((f) => ({ ...f, courseExamPrep: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {EXAM_OPTIONS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>School/College Name *</Label>
                      <Input
                        value={enrollForm.schoolCollegeName}
                        onChange={(e) => setEnrollForm((f) => ({ ...f, schoolCollegeName: e.target.value }))}
                        placeholder="School/College"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Residential Address *</Label>
                    <Input
                      value={enrollForm.residentialAddress}
                      onChange={(e) => setEnrollForm((f) => ({ ...f, residentialAddress: e.target.value }))}
                      placeholder="Full address"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Last year&apos;s result (marksheet) *</Label>
                    <Input
                      ref={enrollMarksheetInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setEnrollMarksheetFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF or image, max {marksheetMaxSizeMB}MB. Admin will review for free access ({freeAccessMarks}%+).
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSendOtp}
                    disabled={
                      sendingOtp ||
                      !enrollForm.contactNumber ||
                      !enrollForm.dateOfBirth ||
                      !enrollForm.gender ||
                      !enrollForm.residentialAddress ||
                      !enrollForm.city ||
                      !enrollForm.pincode ||
                      !enrollForm.classGrade ||
                      !enrollForm.educationBoard ||
                      !enrollForm.streamOpted ||
                      !enrollForm.courseExamPrep ||
                      !enrollForm.schoolCollegeName ||
                      !enrollMarksheetFile
                    }
                    className="gap-2 w-full md:w-auto"
                  >
                    {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Send OTP to Email & Phone
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email OTP (sent to {user?.email})</Label>
                  <div className="flex gap-2">
                    <Input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit OTP" maxLength={6} disabled={emailVerified} />
                    <Button onClick={handleVerifyEmail} disabled={emailVerified || verifying || emailOtp.length !== 6}>
                      {emailVerified ? 'Verified' : verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Phone OTP</Label>
                  <div className="flex gap-2">
                    <Input value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit OTP" maxLength={6} disabled={phoneVerified} />
                    <Button onClick={handleVerifyPhone} disabled={phoneVerified || verifying || phoneOtp.length !== 6}>
                      {phoneVerified ? 'Verified' : verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEnrollStep('form')}>Back</Button>
                  <Button onClick={handleEnroll} disabled={enrollLoading || !emailVerified || !phoneVerified} className="flex-1 gap-2">
                    {enrollLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Complete Enrollment
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasMarksheetUploaded = !!(marksheetInfo.marksheetUrl || (marksheetInfo.marksheetStatus && marksheetInfo.marksheetStatus !== 'removed'));
  const showSheetsAndFilters = hasAccess || notEligibleForFreeAccess;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Practice Series</h1>
          <p className="text-sm text-muted-foreground">Sheets, marksheet for free access ({freeAccessMarks}%+), or pay per subject.</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setProfileOpen(true)}>
          <User className="h-4 w-4" /> Profile
        </Button>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Practice Series Profile
            </DialogTitle>
          </DialogHeader>
          {profileLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : profileData ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Verified</p>
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profileData.emailId}
                    {profileData.emailOtpVerified ? <CheckCircle className="h-4 w-4 text-green-600" title="Verified" /> : null}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    {profileData.contactNumber}
                    {profileData.phoneOtpVerified ? <CheckCircle className="h-4 w-4 text-green-600" title="Verified" /> : null}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border p-3 space-y-2">
                <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Details</p>
                <dl className="grid grid-cols-1 gap-1.5">
                  <ProfileRow label="Name" value={profileData.fullName} />
                  <ProfileRow label="DOB" value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'} />
                  <ProfileRow label="Gender" value={profileData.gender} />
                  <ProfileRow label="Address" value={profileData.residentialAddress} />
                  <ProfileRow label="City" value={profileData.city} />
                  <ProfileRow label="Pincode" value={profileData.pincode} />
                  <ProfileRow label="Class" value={profileData.classGrade} />
                  <ProfileRow label="Board" value={profileData.educationBoard} />
                  <ProfileRow label="Stream" value={profileData.streamOpted} />
                  <ProfileRow label="Exam prep" value={profileData.courseExamPrep} />
                  <ProfileRow label="School / College" value={profileData.schoolCollegeName} />
                  {profileData.lastExamPercentage != null && <ProfileRow label="Last year %" value={`${profileData.lastExamPercentage}%`} />}
                  {profileData.marksheetStatus && <ProfileRow label="Marksheet" value={profileData.marksheetStatus} />}
                </dl>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sheets">Sheets</TabsTrigger>
          <TabsTrigger value="marksheet">Marksheet</TabsTrigger>
        </TabsList>

        <TabsContent value="sheets" className="space-y-4">
          {!showSheetsAndFilters ? (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground text-sm">Upload your marksheet ({freeAccessMarks}%+) for free access.</p>
                <Button variant="link" className="mt-1 p-0 h-auto" onClick={() => setActiveTab('marksheet')}>Go to Marksheet tab →</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {notEligibleForFreeAccess && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 px-4 py-3">
                  <span className="text-sm text-amber-800 dark:text-amber-200">Not eligible for free access. Pay ₹{pricePerSubject}/subject to unlock.</span>
                  <Select value={paySubject} onValueChange={setPaySubject}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {(filterOptions.subjects.length > 0 ? filterOptions.subjects : [...new Set(sheets.map((s: { subject?: string }) => s.subject).filter(Boolean))]).map((sub: string) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handlePayForSubject} disabled={paymentLoading || !paySubject}>
                    {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Pay ₹{pricePerSubject}
                  </Button>
                </div>
              )}

              {/* Single compact filter row */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[140px] max-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                <Select value={subjectFilter || 'all'} onValueChange={(v) => setSubjectFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {filterOptions.subjects.map((sub) => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[110px] h-9 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.categories.map((cat) => <SelectItem key={cat} value={cat}>{cat || '—'}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v: 'newest' | 'oldest' | 'subject' | 'subject-desc') => { setSortBy(v); setPage(1); loadSheets(1, true, { sort: v }); }}>
                  <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="subject">Subject A–Z</SelectItem>
                    <SelectItem value="subject-desc">Subject Z–A</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={applyFilters} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
                <div className="flex rounded-md border overflow-hidden">
                  <Button type="button" variant={layout === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-9 w-9 rounded-r-none p-0" onClick={() => setLayout('grid')}>
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant={layout === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-9 w-9 rounded-l-none p-0" onClick={() => setLayout('list')}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                {(subjectFilter || categoryFilter || searchQuery) && (
                  <Button type="button" variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : sheets.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">No sheets found. <Button variant="link" className="p-0 h-auto" onClick={clearFilters}>Clear filters</Button></p>
              ) : layout === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sheets.map((s) => (
                    <Card key={s._id} className="overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex flex-wrap gap-1 mb-1">
                          <Badge variant="default" className="text-xs">{s.subject}</Badge>
                          {s.category && <Badge variant="outline" className="text-xs">{s.category}</Badge>}
                        </div>
                        <CardTitle className="text-sm leading-tight">{s.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(s.uploadedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4 px-4 mt-auto flex flex-wrap items-center gap-2">
                        {hasAccess && s.canViewSheet && s.pdfUrl && (
                          <Button size="sm" variant="default" className="h-8 text-xs" asChild>
                            <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer"><Download className="h-3 w-3 mr-1" /> Sheet</a>
                          </Button>
                        )}
                        {hasAccess && s.canViewAnswers && s.answerPdfUrl && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                            <a href={s.answerPdfUrl} target="_blank" rel="noopener noreferrer"><FileText className="h-3 w-3 mr-1" /> Answers</a>
                          </Button>
                        )}
                        {hasAccess && !s.canViewSheet && !s.canViewAnswers && (
                          <span className="text-xs text-muted-foreground">Not yet available</span>
                        )}
                        {notEligibleForFreeAccess && (
                          <span className="text-xs text-muted-foreground">Pay ₹{pricePerSubject} to access</span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sheets.map((s) => (
                    <Card key={s._id} className="hover:shadow-sm">
                      <CardContent className="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1 mb-0.5">
                            <Badge variant="default" className="text-xs">{s.subject}</Badge>
                            {s.category && <Badge variant="outline" className="text-xs">{s.category}</Badge>}
                          </div>
                          <h3 className="font-medium text-sm truncate">{s.title}</h3>
                          <p className="text-xs text-muted-foreground">{new Date(s.uploadedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {hasAccess && s.canViewSheet && s.pdfUrl && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                              <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer"><Download className="h-3 w-3 mr-1" /> Sheet</a>
                            </Button>
                          )}
                          {hasAccess && s.canViewAnswers && s.answerPdfUrl && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                              <a href={s.answerPdfUrl} target="_blank" rel="noopener noreferrer"><FileText className="h-3 w-3 mr-1" /> Answers</a>
                            </Button>
                          )}
                          {hasAccess && !s.canViewSheet && !s.canViewAnswers && <span className="text-xs text-muted-foreground">Not yet available</span>}
                          {notEligibleForFreeAccess && <span className="text-xs text-muted-foreground">Pay ₹{pricePerSubject}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Page {page} of {totalPages}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1 || loading}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages || loading}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="marksheet" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Marksheet</CardTitle>
              <CardDescription className="text-sm">
                {hasMarksheetUploaded
                  ? 'Your uploaded marksheet and status.'
                  : `Upload last year's result (PDF/image, max ${marksheetMaxSizeMB}MB). ${freeAccessMarks}%+ and approval = free access.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasMarksheetUploaded ? (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={marksheetInfo.marksheetStatus === 'approved' ? 'default' : marksheetInfo.marksheetStatus === 'rejected' ? 'destructive' : 'secondary'}>
                      {marksheetInfo.marksheetStatus === 'approved' ? 'Approved' : marksheetInfo.marksheetStatus === 'rejected' ? 'Rejected' : 'Pending review'}
                    </Badge>
                    {marksheetInfo.marksheetUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={marksheetInfo.marksheetUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" /> View file
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleRemoveMarksheet} disabled={marksheetRemoveLoading}>
                      {marksheetRemoveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Remove & re-upload
                    </Button>
                  </div>
                  {marksheetInfo.marksheetRejectionReason && (
                    <p className="text-sm text-muted-foreground">{marksheetInfo.marksheetRejectionReason}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-sm">Select file (PDF/image, max {marksheetMaxSizeMB}MB)</Label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setMarksheetFile(e.target.files?.[0] || null)}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleUploadMarksheet} disabled={!marksheetFile || marksheetLoading} className="gap-2">
                    {marksheetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload marksheet
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
