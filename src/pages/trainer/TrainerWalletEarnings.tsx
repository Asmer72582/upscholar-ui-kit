import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Coins,
  TrendingUp,
  TrendingDown,
  History,
  Calendar,
  Gift,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  DollarSign,
  Download,
  BanknoteIcon,
  Building2
} from 'lucide-react';
import { walletService, WalletBalance, WalletTransaction } from '@/services/walletService';
import { toast } from 'sonner';

interface EarningsData {
  totalEarnings: number;
  availableForWithdrawal: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  earningsByMonth: Array<{
    _id: { year: number; month: number };
    total: number;
    count: number;
  }>;
  recentEarnings: WalletTransaction[];
  withdrawalSummary: {
    completed: number;
    pending: number;
    completedCount: number;
    pendingCount: number;
  };
  conversionRate: number;
}

export const TrainerWalletEarnings: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  
  // Withdrawal form state
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch balance and transactions first
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(1, 20)
      ]);
      
      setBalance(balanceData);
      setTransactions(transactionsData.transactions);
      
      // Fetch earnings separately with error handling
      try {
        const earningsData = await walletService.getEarnings();
        setEarnings(earningsData);
      } catch (earningsError) {
        console.error('Error fetching earnings:', earningsError);
        // Set default earnings data if fetch fails
        setEarnings({
          totalEarnings: balanceData.totalEarned || 0,
          availableForWithdrawal: balanceData.balance || 0,
          totalWithdrawn: 0,
          pendingWithdrawals: 0,
          earningsByMonth: [],
          recentEarnings: [],
          withdrawalSummary: {
            completed: 0,
            pending: 0,
            completedCount: 0,
            pendingCount: 0
          },
          conversionRate: 1
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const amount = parseFloat(withdrawalAmount);
      
      if (!amount || amount < 100) {
        toast.error('Minimum withdrawal amount is 100 UpCoins (₹100)');
        return;
      }

      if (amount > (balance?.balance || 0)) {
        toast.error('Insufficient balance');
        return;
      }

      const hasBankDetails = bankDetails.accountNumber && bankDetails.ifscCode && bankDetails.accountHolderName;
      const hasUpiId = upiId.trim().length > 0;

      if (!hasBankDetails && !hasUpiId) {
        toast.error('Please provide either bank details or UPI ID');
        return;
      }

      setWithdrawing(true);
      
      const result = await walletService.requestWithdrawal(amount, bankDetails, upiId);
      
      toast.success(result.message || 'Withdrawal request submitted successfully!');
      setShowWithdrawDialog(false);
      setWithdrawalAmount('');
      setUpiId('');
      setBankDetails({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: ''
      });
      
      // Refresh data
      fetchAllData();
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast.error(error.message || 'Failed to process withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleBuyUpCoins = () => {
    navigate('/trainer/buy-upcoins');
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

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lecture_enrollment':
        return <BookOpen className="w-4 h-4" />;
      case 'upcoin_purchase':
        return <Coins className="w-4 h-4" />;
      case 'joining_bonus':
        return <Gift className="w-4 h-4" />;
      case 'withdrawal':
        return <Download className="w-4 h-4" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lecture_enrollment':
        return 'bg-green-100 text-green-600';
      case 'upcoin_purchase':
        return 'bg-blue-100 text-blue-600';
      case 'joining_bonus':
        return 'bg-purple-100 text-purple-600';
      case 'withdrawal':
        return 'bg-orange-100 text-orange-600';
      case 'refund':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
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
          <h1 className="text-3xl font-bold">Wallet & Earnings</h1>
          <p className="text-muted-foreground">
            Manage your UpCoins, track earnings, and withdraw funds
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Convert your UpCoins to real money (1 UC = ₹1)
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Available Balance</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {balance?.balance || 0} UC = ₹{balance?.balance || 0}
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Withdrawal Amount (UpCoins)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="100"
                    max={balance?.balance || 0}
                    placeholder="Minimum 100 UC"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                  />
                  {withdrawalAmount && parseFloat(withdrawalAmount) > (balance?.balance || 0) && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Insufficient balance! Available: {balance?.balance || 0} UC
                    </p>
                  )}
                  {withdrawalAmount && parseFloat(withdrawalAmount) <= (balance?.balance || 0) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      You will receive: ₹{withdrawalAmount}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    placeholder="Full name as per bank"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Bank account number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    placeholder="Bank IFSC code"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name (Optional)</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g., HDFC Bank"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="upiId">UPI ID (Optional)</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide either bank details or UPI ID
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="font-semibold text-blue-900">Processing Time</p>
                  <p className="text-blue-800">Withdrawals are processed within 2-3 business days</p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                >
                  {withdrawing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Request Withdrawal
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance & Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{balance?.balance || 0} UC</div>
            <p className="text-xs opacity-75 mt-1">
              = ₹{balance?.balance || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{earnings?.totalEarnings || 0} UC</div>
            <p className="text-xs text-muted-foreground mt-1">
              = ₹{earnings?.totalEarnings || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <Download className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{earnings?.totalWithdrawn || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {earnings?.withdrawalSummary.completedCount || 0} withdrawals
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{earnings?.pendingWithdrawals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {earnings?.withdrawalSummary.pendingCount || 0} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="card-elevated bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Withdrawal Information
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Conversion Rate:</strong> 1 UpCoin = ₹1</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Minimum:</strong> 100 UpCoins (₹100)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Processing:</strong> 2-3 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Method:</strong> Direct bank transfer</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-600" />
                How Earnings Work
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Earn 90% when students enroll (10% platform fee)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Creating lectures costs 50 UpCoins each</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Buy more UpCoins anytime via UPI/Card</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Withdraw earnings to your bank account</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Transactions */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest wallet transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getCategoryColor(transaction.category)}`}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.category === 'lecture_enrollment' && transaction.metadata?.studentName && (
                            <p className="text-sm text-muted-foreground">
                              Student: {transaction.metadata.studentName}
                            </p>
                          )}
                          {transaction.category === 'lecture_enrollment' && transaction.metadata?.lectureTitle && (
                            <p className="text-sm text-muted-foreground">
                              Lecture: {transaction.metadata.lectureTitle}
                            </p>
                          )}
                          {transaction.category === 'withdrawal' && transaction.status === 'completed' && (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ Approved & Transferred
                            </p>
                          )}
                          {transaction.category === 'withdrawal' && transaction.status === 'pending' && (
                            <p className="text-sm text-yellow-600 font-medium">
                              ⏳ Awaiting Admin Approval
                            </p>
                          )}
                          {transaction.category === 'withdrawal' && transaction.status === 'failed' && (
                            <p className="text-sm text-red-600 font-medium">
                              ✗ Rejected & Refunded
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(transaction.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} UC
                        </p>
                        {transaction.realMoneyAmount && transaction.realMoneyAmount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ₹{transaction.realMoneyAmount}
                          </p>
                        )}
                        <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start creating lectures and earning UpCoins!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          {/* Earnings by Month */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
              <CardDescription>
                Your earnings breakdown by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earnings?.earningsByMonth && earnings.earningsByMonth.length > 0 ? (
                <div className="space-y-3">
                  {earnings.earningsByMonth.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {getMonthName(month._id.month)} {month._id.year}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {month.count} enrollment{month.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +{month.total} UC
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{month.total}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No earnings yet</h3>
                  <p className="text-muted-foreground">
                    Create lectures and wait for students to enroll
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Earnings */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Recent Earnings</CardTitle>
              <CardDescription>
                Latest student enrollments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earnings?.recentEarnings && earnings.recentEarnings.length > 0 ? (
                <div className="space-y-3">
                  {earnings.recentEarnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{earning.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(earning.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +{earning.amount} UC
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{earning.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No earnings yet</h3>
                  <p className="text-muted-foreground">
                    Earnings will appear here when students enroll
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete history of your wallet activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getCategoryColor(transaction.category)}`}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.category === 'lecture_enrollment' && transaction.metadata?.studentName && (
                            <p className="text-sm text-muted-foreground">
                              Student: {transaction.metadata.studentName}
                            </p>
                          )}
                          {transaction.category === 'withdrawal' && transaction.status === 'completed' && (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ Approved & Transferred
                            </p>
                          )}
                          {transaction.category === 'withdrawal' && transaction.status === 'pending' && (
                            <p className="text-sm text-yellow-600 font-medium">
                              ⏳ Awaiting Admin Approval
                            </p>
                          )}
                          {transaction.category === 'withdrawal' && transaction.status === 'failed' && (
                            <p className="text-sm text-red-600 font-medium">
                              ✗ Rejected & Refunded
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(transaction.createdAt)}</span>
                            {transaction.paymentMethod && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} UC
                        </p>
                        {transaction.realMoneyAmount && transaction.realMoneyAmount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ₹{transaction.realMoneyAmount}
                          </p>
                        )}
                        <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start creating lectures and earning UpCoins!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
