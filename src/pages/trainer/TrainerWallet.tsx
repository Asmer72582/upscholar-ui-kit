import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Filter,
  Calendar,
  Gift,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BookOpen
} from 'lucide-react';
import { walletService, WalletBalance, WalletTransaction } from '@/services/walletService';
import { toast } from 'sonner';

export const TrainerWallet: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lecture_enrollment':
        return <BookOpen className="w-4 h-4" />;
      case 'upcoin_purchase':
        return <Coins className="w-4 h-4" />;
      case 'joining_bonus':
        return <Gift className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lecture_enrollment':
        return 'bg-blue-100 text-blue-600';
      case 'upcoin_purchase':
        return 'bg-green-100 text-green-600';
      case 'joining_bonus':
        return 'bg-purple-100 text-purple-600';
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
          <h1 className="text-3xl font-bold">Trainer Wallet</h1>
          <p className="text-muted-foreground">
            Manage your UpCoins, track earnings, and view transaction history
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
          
          <Button className="gap-2" onClick={handleBuyUpCoins}>
            <Plus className="w-4 h-4" />
            Buy UpCoins
          </Button>
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
            <div className="text-3xl font-bold">{balance?.balance || 0} UC</div>
            <p className="text-xs opacity-75 mt-1">
              Available UpCoins
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{balance?.totalEarned || 0} UC</div>
            <p className="text-xs text-muted-foreground mt-1">
              From student enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{balance?.totalSpent || 0} UC</div>
            <p className="text-xs text-muted-foreground mt-1">
              On course creation
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {((balance?.totalEarned || 0) - (balance?.totalSpent || 0))} UC
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Profit after expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="card-elevated bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Coins className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">How Trainer Wallet Works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Course Creation:</strong> Costs 50 UpCoins per lecture</li>
                <li>• <strong>Student Enrollments:</strong> Earn 90% of lecture price (10% platform fee)</li>
                <li>• <strong>Buy UpCoins:</strong> Purchase more via UPI/Card/NetBanking</li>
                <li>• <strong>Track Everything:</strong> View all earnings and expenses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
                  onClick={handleBuyUpCoins}
                >
                  <Plus className="w-6 h-6" />
                  <span>Buy UpCoins</span>
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
                    Your transaction history will appear here
                  </p>
                  <Button onClick={handleBuyUpCoins}>
                    Buy Your First UpCoins
                  </Button>
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(transaction.createdAt)}</span>
                            {transaction.paymentMethod && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{transaction.paymentMethod}</span>
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
                  <Button onClick={handleBuyUpCoins}>
                    Buy UpCoins
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
