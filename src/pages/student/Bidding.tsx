import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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

  const [form, setForm] = useState<CreateTicketData>({
    grade: '',
    board: '',
    subject: '',
    bookName: '',
    publicationName: '',
    authorName: '',
    chapterName: '',
    topicName: '',
    description: '',
  });

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const res = await biddingService.getTickets({ page, limit: 10 });
      setTickets(res.tickets);
      setPagination(res.pagination);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') fetchTickets();
  }, [activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grade || !form.board || !form.subject || !form.bookName || !form.chapterName || !form.topicName || !form.description) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await biddingService.createTicket(form);
      toast.success('Request created. Trainers will be notified.');
      setForm({
        grade: '', board: '', subject: '', bookName: '', publicationName: '', authorName: '',
        chapterName: '', topicName: '', description: '',
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
      fetchTickets();
    } catch (e: any) {
      toast.error(e.message || 'Failed to select proposal');
    }
  };

  const handleComplete = async (ticketId: string) => {
    try {
      await biddingService.completeTicket(ticketId);
      toast.success('Session marked complete. You can now rate the trainer.');
      setSelectedTicket(null);
      fetchTickets();
    } catch (e: any) {
      toast.error(e.message || 'Failed to complete');
    }
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

  const handleCancel = async (ticketId: string) => {
    if (!confirm('Cancel this request? If payment was held, it will be refunded.')) return;
    try {
      await biddingService.cancelTicket(ticketId);
      toast.success('Request cancelled.');
      setSelectedTicket(null);
      fetchTickets();
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel');
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
        <h1 className="text-2xl font-bold tracking-tight">Request & Bidding</h1>
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
              <CardTitle>New doubt request</CardTitle>
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
                    <Select value={form.board || undefined} onValueChange={(v) => setForm((f) => ({ ...f, board: v }))} required>
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
                  <Label>Description of your doubt *</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe what you need help with..."
                    rows={4}
                    required
                  />
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
                {selectedTicket.subject} · Grade {selectedTicket.grade} · {selectedTicket.board} · {selectedTicket.chapterName} – {selectedTicket.topicName}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>

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
                            {canSelect && (
                              <Button size="sm" className="mt-2 gap-1" onClick={() => handleSelectProposal(selectedTicket._id, p._id)}>
                                <CheckCircle className="h-4 w-4" /> Select & pay
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {selectedTicket.status === 'Booked' && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button size="sm" onClick={() => handleComplete(selectedTicket._id)}>Mark session completed</Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel(selectedTicket._id)}>Cancel request</Button>
                  </div>
                )}
                {selectedTicket.status === 'Completed' && (
                  <Button size="sm" className="mt-2" onClick={() => openRate(selectedTicket._id)}>
                    <Star className="h-4 w-4 mr-1" /> Rate trainer
                  </Button>
                )}
                {['Open', 'Bidding'].includes(selectedTicket.status) && (
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => handleCancel(selectedTicket._id)}>Cancel request</Button>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
