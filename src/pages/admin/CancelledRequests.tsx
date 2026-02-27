import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  adminService,
  CancelledRequest,
} from '@/services/adminService';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageSquare,
  Coins,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const CancelledRequests: React.FC = () => {
  const [requests, setRequests] = useState<CancelledRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request: CancelledRequest | null }>({ open: false, request: null });
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { requests: data } = await adminService.getCancelledRequests(tab);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching cancelled requests:', error);
      toast.error('Failed to load cancelled requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [tab]);

  const handleApprove = async (ticketId: string) => {
    try {
      setProcessing(ticketId);
      await adminService.approveCancelledRequestRefund(ticketId);
      toast.success('Refund approved. Student has been notified.');
      fetchRequests();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to approve refund';
      toast.error(msg);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (request: CancelledRequest) => {
    setRejectDialog({ open: true, request });
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectDialog.request) return;
    try {
      setProcessing(rejectDialog.request.id);
      await adminService.rejectCancelledRequestRefund(rejectDialog.request.id, rejectReason);
      toast.success('Refund rejected. Student has been notified.');
      setRejectDialog({ open: false, request: null });
      setRejectReason('');
      fetchRequests();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to reject refund';
      toast.error(msg);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (d: string) => (d ? new Date(d).toLocaleString() : '–');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student request cancelled</h1>
        <p className="text-muted-foreground">
          Review cancelled student requests (bidding). Approve to send refund to the student; reject to deny refund. Students are notified of your decision.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Refund requests</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Cancelled with reason: only approved requests get refund. Student is notified for both approve and reject.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'pending' | 'approved' | 'rejected')}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mb-2 opacity-50" />
                  <p>No pending refund requests</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {requests.map((r) => (
                    <li
                      key={r.id}
                      className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-medium">{r.ticketId}</span>
                          <Badge variant="secondary">{r.subject}</Badge>
                          <span className="text-sm text-muted-foreground">Grade {r.grade} · {r.board}</span>
                        </div>
                        {r.student && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{r.student.name}</span>
                            <span className="text-muted-foreground">{r.student.email}</span>
                          </div>
                        )}
                        {r.cancelReason && (
                          <div className="flex items-start gap-2 text-sm mt-2 p-2 bg-muted/50 rounded">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{r.cancelReason}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Cancelled: {formatDate(r.cancelledAt)}</span>
                          <span className="flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            {r.escrowAmount} UC
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(r.id)}
                          disabled={!!processing}
                        >
                          {processing === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                          Approve refund
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(r)}
                          disabled={!!processing}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-2 opacity-50" />
                  <p>No approved refunds yet</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {requests.map((r) => (
                    <li key={r.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-medium">{r.ticketId}</span>
                        <Badge variant="secondary">{r.subject}</Badge>
                        <Badge className="bg-green-600">Refunded</Badge>
                      </div>
                      {r.student && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {r.student.name} · {r.student.email}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Cancelled: {formatDate(r.cancelledAt)} · {r.escrowAmount} UC refunded
                      </p>
                      {r.cancelReason && (
                        <p className="text-sm text-muted-foreground mt-1 italic">Reason: {r.cancelReason}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <XCircle className="h-12 w-12 mb-2 opacity-50" />
                  <p>No rejected refunds yet</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {requests.map((r) => (
                    <li key={r.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-medium">{r.ticketId}</span>
                        <Badge variant="secondary">{r.subject}</Badge>
                        <Badge variant="destructive">Refund rejected</Badge>
                      </div>
                      {r.student && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {r.student.name} · {r.student.email}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Cancelled: {formatDate(r.cancelledAt)} · {r.escrowAmount} UC not refunded
                      </p>
                      {r.cancelReason && (
                        <p className="text-sm text-muted-foreground mt-1 italic">Student reason: {r.cancelReason}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject refund request</DialogTitle>
            <DialogDescription>
              The student will be notified that their refund was not approved. You can optionally add a reason below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason (optional)</Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g. Cancellation policy does not allow refund in this case."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialog({ open: false, request: null })}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={!!processing && rejectDialog.request !== null}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Reject refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CancelledRequests;
