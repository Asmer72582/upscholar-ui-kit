import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  CreditCard,
  Calendar,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface BankDetails {
  accountNumber: string;
  accountNumberLast4: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}

interface WithdrawalRequest {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  realMoneyAmount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  reference: string;
  createdAt: string;
  metadata: {
    bankDetails?: BankDetails;
    upiId?: string;
    trainerName: string;
    trainerEmail: string;
    withdrawalAmount: number;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  };
}

export const WithdrawalRequests: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, [selectedTab]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('upscholer_token');
      const status = selectedTab === 'all' ? '' : selectedTab;
      
      const response = await fetch(
        `http://localhost:3000/api/admin/withdrawals${status ? `?status=${status}` : ''}`,
        {
          headers: {
            'x-auth-token': token || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json();
      setWithdrawals(data.withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    try {
      setProcessing(withdrawalId);
      const token = localStorage.getItem('upscholer_token');
      
      const response = await fetch(
        `http://localhost:3000/api/admin/withdrawals/${withdrawalId}/approve`,
        {
          method: 'PUT',
          headers: {
            'x-auth-token': token || '',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve withdrawal');
      }

      toast.success('Withdrawal approved successfully!');
      fetchWithdrawals();
    } catch (error: unknown) {
      console.error('Error approving withdrawal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve withdrawal';
      toast.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(selectedWithdrawal._id);
      const token = localStorage.getItem('upscholer_token');
      
      const response = await fetch(
        `http://localhost:3000/api/admin/withdrawals/${selectedWithdrawal._id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token || '',
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject withdrawal');
      }

      toast.success('Withdrawal rejected and amount refunded');
      setShowRejectDialog(false);
      setSelectedWithdrawal(null);
      setRejectionReason('');
      fetchWithdrawals();
    } catch (error: unknown) {
      console.error('Error rejecting withdrawal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject withdrawal';
      toast.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
          <p className="text-muted-foreground">
            Manage trainer withdrawal requests
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWithdrawals}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {withdrawals.length > 0 ? (
            <div className="grid gap-4">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal._id} className="card-elevated">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          {withdrawal.metadata.trainerName}
                        </CardTitle>
                        <CardDescription>{withdrawal.metadata.trainerEmail}</CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(withdrawal.status)} flex items-center gap-1`}>
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Amount */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Withdrawal Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{withdrawal.realMoneyAmount}</p>
                        <p className="text-sm text-muted-foreground">{withdrawal.amount} UpCoins</p>
                      </div>
                      <Download className="w-8 h-8 text-green-600" />
                    </div>

                    {/* Payment Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Bank Details */}
                      {withdrawal.metadata.bankDetails && (
                        <div className="space-y-3 p-4 border rounded-lg">
                          <div className="flex items-center gap-2 font-semibold">
                            <Building2 className="w-4 h-4" />
                            Bank Details
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Account Holder</Label>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{withdrawal.metadata.bankDetails.accountHolderName}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(withdrawal.metadata.bankDetails!.accountHolderName, `holder-${withdrawal._id}`)}
                              >
                                {copiedField === `holder-${withdrawal._id}` ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">Account Number</Label>
                            <div className="flex items-center gap-2">
                              <p className="font-mono font-medium">{withdrawal.metadata.bankDetails.accountNumber}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(withdrawal.metadata.bankDetails!.accountNumber, `account-${withdrawal._id}`)}
                              >
                                {copiedField === `account-${withdrawal._id}` ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">IFSC Code</Label>
                            <div className="flex items-center gap-2">
                              <p className="font-mono font-medium">{withdrawal.metadata.bankDetails.ifscCode}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(withdrawal.metadata.bankDetails!.ifscCode, `ifsc-${withdrawal._id}`)}
                              >
                                {copiedField === `ifsc-${withdrawal._id}` ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">Bank Name</Label>
                            <p className="font-medium">{withdrawal.metadata.bankDetails.bankName}</p>
                          </div>
                        </div>
                      )}

                      {/* UPI Details */}
                      {withdrawal.metadata.upiId && (
                        <div className="space-y-3 p-4 border rounded-lg">
                          <div className="flex items-center gap-2 font-semibold">
                            <CreditCard className="w-4 h-4" />
                            UPI Details
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">UPI ID</Label>
                            <div className="flex items-center gap-2">
                              <p className="font-mono font-medium">{withdrawal.metadata.upiId}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(withdrawal.metadata.upiId!, `upi-${withdrawal._id}`)}
                              >
                                {copiedField === `upi-${withdrawal._id}` ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Request Info */}
                      <div className="space-y-3 p-4 border rounded-lg">
                        <div className="flex items-center gap-2 font-semibold">
                          <Calendar className="w-4 h-4" />
                          Request Info
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Requested At</Label>
                          <p className="font-medium">{formatDate(withdrawal.createdAt)}</p>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Reference</Label>
                          <p className="font-mono text-xs">{withdrawal.reference}</p>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Payment Method</Label>
                          <p className="font-medium capitalize">{withdrawal.paymentMethod.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {withdrawal.status === 'failed' && withdrawal.metadata.rejectionReason && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-semibold text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-red-800">{withdrawal.metadata.rejectionReason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {withdrawal.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(withdrawal._id)}
                          disabled={processing === withdrawal._id}
                        >
                          {processing === withdrawal._id ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowRejectDialog(true);
                          }}
                          disabled={processing === withdrawal._id}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-elevated">
              <CardContent className="text-center py-12">
                <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No withdrawal requests</h3>
                <p className="text-muted-foreground">
                  {selectedTab === 'pending' && 'No pending withdrawal requests at the moment'}
                  {selectedTab === 'completed' && 'No completed withdrawals yet'}
                  {selectedTab === 'failed' && 'No rejected withdrawals'}
                  {selectedTab === 'all' && 'No withdrawal requests found'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this withdrawal. The amount will be refunded to the trainer's wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Invalid bank details, suspicious activity, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedWithdrawal(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processing !== null}
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject & Refund
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
