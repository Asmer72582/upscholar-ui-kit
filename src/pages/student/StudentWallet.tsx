import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DollarSign,
  Filter,
  Calendar,
  BookOpen,
  Gift,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { walletService, WalletBalance, WalletTransaction } from '@/services/walletService';
import { toast } from 'sonner';

export const StudentWallet: React.FC = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [adding, setAdding] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [transactionFilter, setTransactionFilter] = useState({
    type: 'all',
    category: 'all',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 0,
    total: 0,
    limit: 20
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (selectedTab === 'transactions') {
      fetchTransactions();
    }
  }, [selectedTab, transactionFilter, pagination.current]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const balanceData = await walletService.getBalance();
      setBalance(balanceData);
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      toast.error(error.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const filters = {
        type: transactionFilter.type !== 'all' ? transactionFilter.type : undefined,
        category: transactionFilter.category !== 'all' ? transactionFilter.category : undefined,
        status: transactionFilter.status !== 'all' ? transactionFilter.status : undefined
      };

      const transactionData = await walletService.getTransactions(
        pagination.current, 
        pagination.limit, 
        filters
      );
      
      setTransactions(transactionData.transactions);
      setPagination(transactionData.pagination);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error(error.message || 'Failed to load transactions');
    }
  };

  const handleAddFunds = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(addAmount);
    if (amount < 1) {
      toast.error('Minimum amount is 1 UC');
      return;
    }

    if (amount > 10000) {
      toast.error('Maximum amount is 10,000 UC');
      return;
    }

    try {
      setAdding(true);
      await walletService.addFunds(amount, paymentMethod);
      toast.success('Funds added successfully!');
      setShowAddFunds(false);
      setAddAmount('');
      await fetchWalletData();
      if (selectedTab === 'transactions') {
        await fetchTransactions();
      }
    } catch (error: any) {
      console.error('Error adding funds:', error);
      toast.error(error.message || 'Failed to add funds');
    } finally {
      setAdding(false);
    }
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lecture_enrollment':
        return <BookOpen className="w-4 h-4" />;
      case 'funds_added':
        return <Plus className="w-4 h-4" />;
      case 'bonus':
        return <Gift className="w-4 h-4" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lecture_enrollment':
        return 'bg-blue-100 text-blue-600';
      case 'funds_added':
        return 'bg-green-100 text-green-600';
      case 'bonus':
        return 'bg-purple-100 text-purple-600';
      case 'refund':
        return 'bg-orange-100 text-orange-600';
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
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your Upcoins and transaction history
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWalletData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          
          <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
                <DialogDescription>
                  Add Upcoins to your wallet to enroll in lectures
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount (Upcoins)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount (1-10,000)"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    min="1"
                    max="10000"
                    step="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum: 1 UC • Maximum: 10,000 UC
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="paypal">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          PayPal
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Amount:</span>
                    <span>{addAmount || '0'} UC</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing Fee:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex items-center justify-between font-medium border-t pt-2 mt-2">
                    <span>Total (USD):</span>
                    <span>${(parseFloat(addAmount) || 0).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    1 Upcoin = $1.00 USD
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddFunds(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAddFunds}
                    disabled={adding || !addAmount}
                  >
                    {adding ? 'Processing...' : 'Add Funds'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Coins className="w-6 h-6" />
              {balance?.balance || 0} UC
            </div>
            <p className="text-xs opacity-75 mt-1">
              Available for spending
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {balance?.totalEarned || 0} UC
            </div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {balance?.totalSpent || 0} UC
            </div>
            <p className="text-xs text-muted-foreground">
              All time spending
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {balance?.pendingBalance || 0} UC
            </div>
            <p className="text-xs text-muted-foreground">
              Processing transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common wallet operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col space-y-2"
                  onClick={() => setShowAddFunds(true)}
                >
                  <Plus className="w-6 h-6" />
                  <span>Add Funds</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col space-y-2"
                  onClick={() => setSelectedTab('transactions')}
                >
                  <History className="w-6 h-6" />
                  <span>View History</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col space-y-2"
                  onClick={fetchWalletData}
                >
                  <RefreshCw className="w-6 h-6" />
                  <span>Refresh</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest wallet transactions
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedTab('transactions')}
                >
                  View All
                </Button>
              </div>
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(transaction.createdAt)}</span>
                            {transaction.relatedLecture && (
                              <>
                                <span>•</span>
                                <span>{transaction.relatedLecture.title}</span>
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
                    Your transaction history will appear here
                  </p>
                  <Button onClick={() => setShowAddFunds(true)}>
                    Add Your First Funds
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select 
                    value={transactionFilter.type} 
                    onValueChange={(value) => setTransactionFilter(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credit">Credits</SelectItem>
                      <SelectItem value="debit">Debits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select 
                    value={transactionFilter.category} 
                    onValueChange={(value) => setTransactionFilter(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="lecture_enrollment">Lecture Enrollment</SelectItem>
                      <SelectItem value="funds_added">Funds Added</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select 
                    value={transactionFilter.status} 
                    onValueChange={(value) => setTransactionFilter(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete history of your wallet transactions ({pagination.total} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getCategoryColor(transaction.category)}`}>
                            {getCategoryIcon(transaction.category)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(transaction.createdAt)}</span>
                              {transaction.paymentMethod && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{transaction.paymentMethod}</span>
                                </>
                              )}
                              {transaction.relatedLecture && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.relatedLecture.title}</span>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Balance: {transaction.balanceBefore} UC → {transaction.balanceAfter} UC
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} UC
                          </p>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                        disabled={pagination.current === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pagination.current} of {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                        disabled={pagination.current === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or add some funds to get started
                  </p>
                  <Button onClick={() => setShowAddFunds(true)}>
                    Add Funds
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};