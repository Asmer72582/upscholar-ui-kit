import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import {
  ListTodo,
  Send,
  FileText,
  Calendar,
  Clock,
  Coins,
  Loader2,
  MessageSquare,
  Info,
  BookOpen,
  Search,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { biddingService, type Ticket, type Proposal, type CreateProposalData } from '@/services/biddingService';
import { toast } from 'sonner';

const BIDDING_SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science', 'English', 'Hindi',
  'Social Studies', 'Accountancy', 'Business Studies', 'Economics', 'Computer Science', 'Other'
];

export const TrainerBidding: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(false);
  const [searchTickets, setSearchTickets] = useState('');
  const [searchProposals, setSearchProposals] = useState('');
  const [debouncedSearchTickets, setDebouncedSearchTickets] = useState('');
  const [debouncedSearchProposals, setDebouncedSearchProposals] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [paginationTickets, setPaginationTickets] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [paginationProposals, setPaginationProposals] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState<CreateProposalData>({
    date: '',
    time: '',
    duration: 60,
    price: 0,
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [creatingLectureTicketId, setCreatingLectureTicketId] = useState<string | null>(null);

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const res = await biddingService.getTickets({ page, limit: 10, search: debouncedSearchTickets || undefined });
      setTickets(res.tickets);
      setPaginationTickets(res.pagination);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async (page = 1) => {
    setLoading(true);
    try {
      const res = await biddingService.getMyProposals({ page, limit: 10, search: debouncedSearchProposals || undefined });
      setProposals(res.proposals);
      setPaginationProposals(res.pagination);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t1 = setTimeout(() => setDebouncedSearchTickets(searchTickets), 400);
    const t2 = setTimeout(() => setDebouncedSearchProposals(searchProposals), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [searchTickets, searchProposals]);

  useEffect(() => {
    if (activeTab === 'requests') fetchTickets(1);
    else fetchProposals(1);
  }, [activeTab, debouncedSearchTickets, debouncedSearchProposals]);

  const openSubmitProposal = (t: Ticket) => {
    setSelectedTicket(t);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setProposalForm({
      date: tomorrow.toISOString().slice(0, 10),
      time: '10:00',
      duration: 60,
      price: 100,
      message: '',
    });
    setSubmitOpen(true);
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!proposalForm.date || !proposalForm.time || proposalForm.duration < 15 || proposalForm.price < 0) {
      toast.error('Please fill date, time, duration (min 15) and price.');
      return;
    }
    setSubmitting(true);
    try {
      await biddingService.createProposal(selectedTicket._id, {
        date: proposalForm.date,
        time: proposalForm.time,
        duration: proposalForm.duration,
        price: proposalForm.price,
        message: proposalForm.message || undefined,
      });
      toast.success('Proposal submitted.');
      setSubmitOpen(false);
      setSelectedTicket(null);
      fetchTickets();
      fetchProposals();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-slate-100 text-slate-700';
      case 'Bidding': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Accepted': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCreateLecture = async (ticketId: string) => {
    setCreatingLectureTicketId(ticketId);
    try {
      const res = await biddingService.createLectureFromTicket(ticketId);
      toast.success(res.message || 'Lecture created. Student is already enrolled.');
      fetchProposals();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create lecture');
    } finally {
      setCreatingLectureTicketId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doubt Solutions</h1>
        <p className="text-muted-foreground">Browse doubt requests from students and submit your proposals (up to 3 per request).</p>
      </div>

      <Alert className="border-blue-200 bg-blue-50/50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>How you get matched to requests</AlertTitle>
        <AlertDescription>
          Requests are matched using your <strong>Subjects</strong> (set as &quot;Areas of expertise&quot; in{' '}
          <Link to="/trainer/settings" className="font-medium text-primary underline underline-offset-2">Settings → Profile</Link>).
          Use the same subject names as students so requests appear here, e.g.: {BIDDING_SUBJECT_OPTIONS.join(', ')}.
          Optionally set <strong>Grades</strong> and <strong>Boards</strong> in Settings to filter which requests you see.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="h-4 w-4" /> Open requests
          </TabsTrigger>
          <TabsTrigger value="proposals" className="gap-2">
            <ListTodo className="h-4 w-4" /> My proposals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, subject, chapter, topic, book..."
                value={searchTickets}
                onChange={(e) => setSearchTickets(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchTickets && (
              <Button variant="ghost" size="sm" onClick={() => setSearchTickets('')}>
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
                No matching requests right now. Requests matching your subject (and grade/board if set) will appear here.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <Card key={t._id}>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-medium">{t.ticketId}</span>
                      <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t.subject} · Grade {t.grade} · {t.board}
                    </p>
                    <p className="font-medium">{t.chapterName} – {t.topicName}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Book: {t.bookName}
                      {t.publicationName && ` · ${t.publicationName}`}
                    </p>
                    <Button size="sm" className="mt-3 gap-1" onClick={() => openSubmitProposal(t)}>
                      <Send className="h-4 w-4" /> Submit proposal
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {paginationTickets.pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={paginationTickets.page <= 1} onClick={() => fetchTickets(paginationTickets.page - 1)}>Previous</Button>
                  <span className="text-sm text-muted-foreground self-center">Page {paginationTickets.page} of {paginationTickets.pages}</span>
                  <Button variant="outline" size="sm" disabled={paginationTickets.page >= paginationTickets.pages} onClick={() => fetchTickets(paginationTickets.page + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="proposals" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, subject, chapter, topic..."
                value={searchProposals}
                onChange={(e) => setSearchProposals(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchProposals && (
              <Button variant="ghost" size="sm" onClick={() => setSearchProposals('')}>
                Clear
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : proposals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                You haven’t submitted any proposals yet. Go to &quot;Open requests&quot; to submit.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {proposals.map((p) => {
                const ticket = typeof p.ticket === 'object' ? p.ticket : null;
                const ticketStatus = ticket && 'status' in ticket ? (ticket as { status?: string }).status : null;
                const isCancelled = p.status === 'Cancelled' || ticketStatus === 'Cancelled';
                return (
                  <Card key={p._id} className={isCancelled ? 'opacity-90 border-red-200' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-sm">{ticket?.ticketId || (p.ticket as string)}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                          {isCancelled && (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Request cancelled by student
                            </Badge>
                          )}
                        </div>
                      </div>
                      {ticket && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {ticket.subject} · {ticket.chapterName} – {ticket.topicName}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(p.date).toLocaleDateString()} · {p.time}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {p.duration} min</span>
                        <span className="flex items-center gap-1"><Coins className="h-4 w-4" /> {p.price} UpCoins</span>
                      </div>
                      {p.status === 'Accepted' && ticket && !(ticket as Ticket).lecture && !isCancelled && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            disabled={creatingLectureTicketId === (ticket as { _id?: string })._id}
                            onClick={() => handleCreateLecture((ticket as { _id: string })._id)}
                          >
                            {creatingLectureTicketId === (ticket as { _id?: string })._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <BookOpen className="h-4 w-4" />
                            )}
                            Create Lecture
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">Creates a 1-on-1 lecture (pending). Student is already enrolled; no further enrollments. Admin must approve the lecture.</p>
                        </div>
                      )}
                      {p.status === 'Accepted' && ticket && (ticket as Ticket).lecture && (
                        <div className="mt-3">
                          <Link to={`/trainer/lectures/${(ticket as Ticket).lecture}/details`}>
                            <Button size="sm" variant="outline" className="gap-1">
                              <BookOpen className="h-4 w-4" /> View Lecture
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {paginationProposals.pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={paginationProposals.page <= 1} onClick={() => fetchProposals(paginationProposals.page - 1)}>Previous</Button>
                  <span className="text-sm text-muted-foreground self-center">Page {paginationProposals.page} of {paginationProposals.pages}</span>
                  <Button variant="outline" size="sm" disabled={paginationProposals.page >= paginationProposals.pages} onClick={() => fetchProposals(paginationProposals.page + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit proposal dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit proposal</DialogTitle>
            <DialogDescription>
              {selectedTicket && (
                <>Request {selectedTicket.ticketId}: {selectedTicket.chapterName} – {selectedTicket.topicName}. You can submit up to 3 proposals per request.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProposal} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={proposalForm.date}
                  onChange={(e) => setProposalForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={proposalForm.time}
                  onChange={(e) => setProposalForm((f) => ({ ...f, time: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (min) *</Label>
                <Input
                  type="number"
                  min={15}
                  max={480}
                  value={proposalForm.duration}
                  onChange={(e) => setProposalForm((f) => ({ ...f, duration: parseInt(e.target.value, 10) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price (UpCoins) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={proposalForm.price}
                  onChange={(e) => setProposalForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Message (optional)</Label>
              <Textarea
                value={proposalForm.message}
                onChange={(e) => setProposalForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Short note to the student"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit proposal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
