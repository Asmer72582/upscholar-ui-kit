import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileQuestion,
  ListTodo,
  Send,
  Star,
  Calendar,
  Clock,
  Coins,
  User,
  CheckCircle,
  Loader2,
  Eye,
  Lock,
  Video,
  Search,
  Paperclip,
  X,
} from 'lucide-react';
import { biddingService, type Ticket, type Proposal, type CreateTicketData } from '@/services/biddingService';
import { toast } from 'sonner';

const GRADE_OPTIONS = ['8', '9', '10', '11', '12'];
const BOARD_OPTIONS = ['CBSE', 'ICSE', 'SSC', 'State Board', 'Other'];
const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science', 'English', 'Hindi',
  'Social Studies', 'Accountancy', 'Business Studies', 'Economics', 'Computer Science', 'Other'
];

export const StudentBidding: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [rateTicketId, setRateTicketId] = useState<string | null>(null);
  const [rateValue, setRateValue] = useState(5);
  const [rateReview, setRateReview] = useState('');
  const [rateSubmitting, setRateSubmitting] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTicketId, setCancelTicketId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelRequiresReason, setCancelRequiresReason] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [profileModalProposal, setProfileModalProposal] = useState<Proposal | null>(null);
  const [trainerProfile, setTrainerProfile] = useState<{
    profile: { name: string; avatar?: string | null; bio: string; experience: number; expertise: string[]; averageRating: number; totalRatings: number; sessionsCompleted: number; whyChooseMe: string[] };
    reviews: { rating: number; review: string; createdAt: string; studentName: string }[];
  } | null>(null);
  const [trainerProfileLoading, setTrainerProfileLoading] = useState(false);

  const [form, setForm] = useState<CreateTicketData>({
    grade: '',
    board: '',
    state: '',
    subject: '',
    bookName: '',
    publicationName: '',
    authorName: '',
    chapterName: '',
    topicName: '',
    description: '',
    attachments: [],
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const res = await biddingService.getTickets({ page, limit: 10, search: debouncedSearch || undefined });
      setTickets(res.tickets);
      setPagination(res.pagination);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab === 'requests') fetchTickets(1);
  }, [activeTab, debouncedSearch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grade || !form.board || !form.subject || !form.bookName || !form.chapterName || !form.topicName || !form.description) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.board === 'SSC' && !form.state?.trim()) {
      toast.error('Please specify your state for SSC board');
      return;
    }
    setLoading(true);
    try {
      await biddingService.createTicket(form);
      toast.success('Request created. Trainers will be notified.');
      setForm({
        grade: '', board: '', state: '', subject: '', bookName: '', publicationName: '', authorName: '',
        chapterName: '', topicName: '', description: '', attachments: [],
      });
      setActiveTab('requests');
      fetchTickets(1);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (t: Ticket) => {
    setSelectedTicket(t);
    setProposals([]);
    setDetailLoading(true);
    try {
      const res = await biddingService.getProposals(t._id);
      setProposals(res.proposals);
      if (t.status === 'Completed') {
        const ticketRes = await biddingService.getTicket(t._id);
        if (ticketRes.ticket.hasRated === false) {
          setTimeout(() => openRate(t._id), 300);
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load proposals');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectProposal = async (ticketId: string, proposalId: string) => {
    try {
      await biddingService.selectProposal(ticketId, proposalId);
      toast.success('Proposal selected. Payment held in escrow.');
      setSelectedTicket(null);
      setProfileModalProposal(null);
      setTrainerProfile(null);
      fetchTickets();
    } catch (e: any) {
      toast.error(e.message || 'Failed to select proposal');
    }
  };

  const openTrainerProfile = async (p: Proposal) => {
    const raw = typeof p.trainer === 'object' && p.trainer !== null
      ? (p.trainer as { _id?: string })._id
      : p.trainer;
    const trainerId = raw != null ? String(raw) : '';
    if (!trainerId) {
      toast.error('Trainer information is missing');
      return;
    }
    setProfileModalProposal(p);
    setTrainerProfile(null);
    setTrainerProfileLoading(true);
    try {
      const res = await biddingService.getTrainerProfile(trainerId);
      setTrainerProfile({ profile: res.profile, reviews: res.reviews });
    } catch (e: any) {
      toast.error(e.message || 'Failed to load trainer profile');
      setProfileModalProposal(null);
    } finally {
      setTrainerProfileLoading(false);
    }
  };

  const closeProfileModal = () => {
    setProfileModalProposal(null);
    setTrainerProfile(null);
  };

  const openRate = (ticketId: string) => {
    setRateTicketId(ticketId);
    setRateValue(5);
    setRateReview('');
    setRateOpen(true);
  };

  const submitRate = async () => {
    if (!rateTicketId) return;
    setRateSubmitting(true);
    try {
      await biddingService.rateTicket(rateTicketId, rateValue, rateReview);
      toast.success('Thank you for your rating!');
      setRateOpen(false);
      setRateTicketId(null);
      fetchTickets();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit rating');
    } finally {
      setRateSubmitting(false);
    }
  };

  const openCancel = (ticketId: string, isBooked: boolean) => {
    setCancelTicketId(ticketId);
    setCancelReason('');
    setCancelRequiresReason(isBooked);
    setCancelOpen(true);
  };

  const handleCancelSubmit = async () => {
    if (!cancelTicketId) return;
    if (cancelRequiresReason && (!cancelReason.trim() || cancelReason.trim().length < 10)) {
      toast.error('Please provide a valid reason (at least 10 characters) to cancel this booked session and request a refund.');
      return;
    }
    setCancelSubmitting(true);
    try {
      await biddingService.cancelTicket(cancelTicketId, cancelReason.trim() || undefined);
      toast.success(cancelRequiresReason ? 'Request cancelled. Refund has been processed.' : 'Request cancelled.');
      setCancelOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-slate-100 text-slate-700';
      case 'Bidding': return 'bg-blue-100 text-blue-700';
      case 'Booked': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ask an Expert</h1>
        <p className="text-muted-foreground">Create a doubt request and get proposals from trainers. Compare and book a session.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create" className="gap-2">
            <FileQuestion className="h-4 w-4" /> Create Request
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <ListTodo className="h-4 w-4" /> My Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Your Doubt Details</CardTitle>
              <CardDescription>Fill in the details. Trainers matching your subject, grade and board will be notified.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Grade *</Label>
                    <Select value={form.grade || undefined} onValueChange={(v) => setForm((f) => ({ ...f, grade: v }))} required>
                      <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Board *</Label>
                    <Select
                      value={form.board || undefined}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          board: v,
                          // Clear state when switching away from SSC so we don't send stale data
                          state: v === 'SSC' ? f.state : '',
                        }))
                      }
                      required
                    >
                      <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
                      <SelectContent>
                        {BOARD_OPTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select value={form.subject || undefined} onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))} required>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {SUBJECT_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.board === 'SSC' && (
                    <div className="space-y-2">
                      <Label>State (for SSC board) *</Label>
                      <Input
                        value={form.state || ''}
                        onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                        placeholder="e.g. Maharashtra, Gujarat, Karnataka"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Required when you select SSC board so we can match trainers from your state syllabus.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Book name *</Label>
                    <Input
                      value={form.bookName}
                      onChange={(e) => setForm((f) => ({ ...f, bookName: e.target.value }))}
                      placeholder="e.g. NCERT Mathematics"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Publication</Label>
                    <Input
                      value={form.publicationName}
                      onChange={(e) => setForm((f) => ({ ...f, publicationName: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Author name</Label>
                  <Input
                    value={form.authorName}
                    onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Chapter name *</Label>
                    <Input
                      value={form.chapterName}
                      onChange={(e) => setForm((f) => ({ ...f, chapterName: e.target.value }))}
                      placeholder="e.g. Quadratic Equations"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Topic name *</Label>
                    <Input
                      value={form.topicName}
                      onChange={(e) => setForm((f) => ({ ...f, topicName: e.target.value }))}
                      placeholder="e.g. Solving by formula"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Describe Your Doubt *</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe what you need help with..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Paperclip className="h-4 w-4" /> Attachments (optional)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Upload images or PDF to better explain your doubt. Max 10MB per file.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      className="sr-only"
                      disabled={uploadingFile}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files?.length) return;
                        setUploadingFile(true);
                        try {
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error(`${file.name} is over 10MB. Skipped.`);
                              continue;
                            }
                            const result = await biddingService.uploadDoubtFile(file);
                            setForm((f) => ({
                              ...f,
                              attachments: [...(f.attachments || []), { url: result.url, name: result.name || file.name }],
                            }));
                          }
                        } catch (err: unknown) {
                          toast.error(err instanceof Error ? err.message : 'Failed to upload file');
                        } finally {
                          setUploadingFile(false);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={uploadingFile}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                      {uploadingFile ? 'Uploading...' : 'Add file'}
                    </Button>
                    {(form.attachments?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.attachments?.map((att, idx) => (
                          <span
                            key={`${att.url}-${idx}`}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                          >
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[140px]">
                              {att.name || 'Attachment'}
                            </a>
                            <button
                              type="button"
                              aria-label="Remove"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  attachments: f.attachments?.filter((_, i) => i !== idx) ?? [],
                                }))
                              }
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, subject, chapter, topic, book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                Clear
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No requests yet. Create one in the &quot;Create Request&quot; tab.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <Card key={t._id} className="cursor-pointer hover:border-primary/50" onClick={() => openDetail(t)}>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-medium">{t.ticketId}</span>
                        <Badge className={`ml-2 ${getStatusColor(t.status)}`}>{t.status}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {t.subject} · {t.grade} · {t.board}
                        {t.board === 'SSC' && (t as any).state ? ` · ${(t as any).state}` : ''}
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{t.chapterName} – {t.topicName}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>
                  </CardContent>
                </Card>
              ))}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchTickets(pagination.page - 1)}>Previous</Button>
                  <span className="text-sm text-muted-foreground self-center">Page {pagination.page} of {pagination.pages}</span>
                  <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchTickets(pagination.page + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail / Proposals modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="font-mono">{selectedTicket.ticketId}</span>
                <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedTicket.subject} · Grade {selectedTicket.grade} · {selectedTicket.board}
                {selectedTicket.board === 'SSC' && (selectedTicket as any).state ? ` · ${(selectedTicket as any).state}` : ''} · {selectedTicket.chapterName} – {selectedTicket.topicName}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      {att.name || 'Attachment'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {detailLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <div className="space-y-4 mt-4">
                <h4 className="font-medium">Proposals ({proposals.length})</h4>
                {proposals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No proposals yet.</p>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((p) => {
                      const trainer = typeof p.trainer === 'object' ? p.trainer : null;
                      const name = trainer?.name || trainer?.email || 'Trainer';
                      const rating = trainer?.averageRating ?? 0;
                      const isAccepted = p.status === 'Accepted';
                      const isPending = p.status === 'Pending';
                      const canSelect = (selectedTicket.status === 'Open' || selectedTicket.status === 'Bidding') && isPending;
                      return (
                        <Card key={p._id} className={isAccepted ? 'border-green-200 bg-green-50/50' : ''}>
                          <CardContent className="pt-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{name}</span>
                                {rating > 0 && (
                                  <span className="flex items-center gap-1 text-sm text-amber-600">
                                    <Star className="h-3.5 w-3.5 fill-current" /> {rating.toFixed(1)} ({trainer?.totalRatings ?? 0})
                                  </span>
                                )}
                              </div>
                              <Badge variant={isAccepted ? 'default' : isPending ? 'secondary' : 'outline'}>{p.status}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(p.date).toLocaleDateString()} · {p.time}</span>
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {p.duration} min</span>
                              <span className="flex items-center gap-1"><Coins className="h-4 w-4" /> {p.price} UpCoins</span>
                            </div>
                            {p.message && <p className="text-sm text-muted-foreground mt-1">{p.message}</p>}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" className="gap-1" onClick={(e) => { e.stopPropagation(); openTrainerProfile(p); }}>
                                <Eye className="h-4 w-4" /> View profile
                              </Button>
                              {canSelect && (
                                <Button size="sm" className="gap-1" onClick={() => handleSelectProposal(selectedTicket._id, p._id)}>
                                  <CheckCircle className="h-4 w-4" /> Select & pay
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {selectedTicket.status === 'Booked' && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline" onClick={() => openCancel(selectedTicket._id, true)}>Cancel request</Button>
                  </div>
                )}
                {selectedTicket.status === 'Completed' && (
                  <Button size="sm" className="mt-2" onClick={() => openRate(selectedTicket._id)}>
                    <Star className="h-4 w-4 mr-1" /> Rate trainer
                  </Button>
                )}
                {['Open', 'Bidding'].includes(selectedTicket.status) && (
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => openCancel(selectedTicket._id, false)}>Cancel request</Button>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Trainer profile modal (when viewing a proposal) */}
      <Dialog open={!!profileModalProposal} onOpenChange={(open) => !open && closeProfileModal()}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trainer profile</DialogTitle>
            <DialogDescription id="trainer-profile-desc">
              {trainerProfileLoading ? 'Loading trainer details…' : profileModalProposal && trainerProfile ? 'Review trainer details and book this session.' : profileModalProposal ? 'Could not load profile.' : ''}
            </DialogDescription>
          </DialogHeader>
          {trainerProfileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : profileModalProposal && trainerProfile ? (
            <>
              <div className="space-y-6 pb-2">
                {/* Trainer header */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16 shrink-0 ring-2 ring-border">
                      <AvatarImage src={trainerProfile.profile.avatar ?? undefined} alt={trainerProfile.profile.name} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {trainerProfile.profile.name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xl">{trainerProfile.profile.name}</span>
                        <CheckCircle className="h-5 w-5 text-primary" aria-label="Verified" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trainerProfile.profile.expertise?.length ? trainerProfile.profile.expertise.join(', ') : 'Expert'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trainerProfile.profile.experience ? `${trainerProfile.profile.experience}+ Years Experience` : ''}
                        {trainerProfile.profile.expertise?.length ? ` · ${trainerProfile.profile.expertise[0]} Expert` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">{trainerProfile.profile.sessionsCompleted}+ Sessions Completed</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {trainerProfile.profile.averageRating?.toFixed(1) ?? '0'}
                        </span>
                        <span className="text-sm text-muted-foreground">({trainerProfile.profile.totalRatings} Reviews)</span>
                        <span className="text-xs text-muted-foreground">Avg. Response Time: 5 mins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Choose Me - from trainer profile (saved in Settings) */}
                <div className="rounded-xl border bg-muted/30 p-4">
                  <h4 className="font-semibold text-base mb-3">Why Choose Me?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(trainerProfile.profile.whyChooseMe?.filter(Boolean).length
                      ? trainerProfile.profile.whyChooseMe.filter(Boolean)
                      : ['Best Value on Platform', 'Top 10% Rated Tutor', 'Fast Response Time']
                    ).map((point, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Session details (from proposal) */}
                <div className="rounded-xl border p-4 space-y-2">
                  <h4 className="font-semibold text-base">Session details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Price: {profileModalProposal.price} UC</span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Duration: {profileModalProposal.duration} Minutes</span>
                    <span className="flex items-center gap-2 sm:col-span-2"><Calendar className="h-4 w-4" /> Available: {new Date(profileModalProposal.date).toLocaleDateString()}, {profileModalProposal.time}</span>
                    <span className="flex items-center gap-2 sm:col-span-2"><Video className="h-4 w-4" /> Live Video · Chat · Whiteboard</span>
                  </div>
                </div>

                {/* About Me */}
                {trainerProfile.profile.bio && (
                  <div className="rounded-xl border p-4">
                    <h4 className="font-semibold text-base mb-2">About Me</h4>
                    <p className="text-sm text-muted-foreground">{trainerProfile.profile.bio}</p>
                  </div>
                )}

                {/* Student Reviews */}
                <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
                  <div className="mb-1">
                    <h4 className="font-semibold text-base text-foreground">Student Reviews</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">From completed 1-on-1 sessions</p>
                  </div>
                  <div className="space-y-4 mt-4">
                    {!trainerProfile.reviews?.length ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No session reviews yet.</p>
                    ) : (
                      trainerProfile.reviews.slice(0, 5).map((r, i) => (
                        <div
                          key={i}
                          className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex flex-col items-center shrink-0 w-14">
                            <span className="flex gap-0.5 text-amber-500" aria-label={`${r.rating} out of 5 stars`}>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star key={n} className={`h-4 w-4 ${n <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/50'}`} />
                              ))}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">{r.rating}/5</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{r.studentName}</p>
                            <p className={`text-sm mt-1 ${r.review ? 'text-foreground/90' : 'text-muted-foreground italic'}`}>
                              {r.review || 'No written review'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeProfileModal}>Close</Button>
                {(selectedTicket?.status === 'Open' || selectedTicket?.status === 'Bidding') && profileModalProposal.status === 'Pending' && (
                  <Button onClick={() => handleSelectProposal(selectedTicket._id, profileModalProposal._id)}>
                    Book Session ({profileModalProposal.price} UC)
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : profileModalProposal ? (
            <div className="py-8 text-center text-muted-foreground">Could not load profile.</div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Cancel request dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel request</DialogTitle>
            <DialogDescription>
              {cancelRequiresReason
                ? 'This session is booked and payment is held. To request a refund, you must provide a valid reason (min 10 characters).'
                : 'Cancel this request? No payment has been held.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason {cancelRequiresReason ? '(required for refund)' : '(optional)'}</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={cancelRequiresReason ? 'e.g. Schedule conflict, need to reschedule...' : 'Optional'}
                rows={3}
                minLength={cancelRequiresReason ? 10 : undefined}
              />
              {cancelRequiresReason && (
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters. Refund will be processed after you submit.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleCancelSubmit} disabled={cancelSubmitting}>
              {cancelSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate dialog */}
      <Dialog open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate this session</DialogTitle>
            <DialogDescription>Your rating helps other students and improves our trainers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="p-2 rounded-full hover:bg-muted"
                  onClick={() => setRateValue(n)}
                >
                  <Star className={`h-8 w-8 ${n <= rateValue ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Review (optional)</Label>
              <Textarea value={rateReview} onChange={(e) => setRateReview(e.target.value)} placeholder="How was the session?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateOpen(false)}>Cancel</Button>
            <Button onClick={submitRate} disabled={rateSubmitting}>
              {rateSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
