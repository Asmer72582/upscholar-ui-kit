import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const walletData = {
  balance: 485,
  totalSpent: 890,
  totalEarned: 1375,
  monthlyLimit: 1000,
  pendingTransactions: 2,
};

const transactions = [
  {
    id: 'txn-1',
    type: 'debit' as const,
    amount: 75,
    description: 'Enrolled in Advanced TypeScript Patterns',
    date: '2024-01-12T15:30:00Z',
    status: 'completed',
    relatedLectureId: 'lecture-2',
  },
  {
    id: 'txn-2',
    type: 'credit' as const,
    amount: 200,
    description: 'Purchased Upcoins',
    date: '2024-01-10T10:00:00Z',
    status: 'completed',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'txn-3',
    type: 'debit' as const,
    amount: 50,
    description: 'Enrolled in Introduction to React Hooks',
    date: '2024-01-10T10:15:00Z',
    status: 'completed',
    relatedLectureId: 'lecture-1',
  },
  {
    id: 'txn-4',
    type: 'credit' as const,
    amount: 25,
    description: 'Referral bonus from inviting Sarah',
    date: '2024-01-08T14:20:00Z',
    status: 'completed',
  },
  {
    id: 'txn-5',
    type: 'debit' as const,
    amount: 45,
    description: 'Enrolled in JavaScript Fundamentals',
    date: '2024-01-05T09:00:00Z',
    status: 'completed',
    relatedLectureId: 'lecture-3',
  },
  {
    id: 'txn-6',
    type: 'credit' as const,
    amount: 100,
    description: 'Welcome bonus',
    date: '2024-01-01T00:00:00Z',
    status: 'completed',
  },
  {
    id: 'txn-7',
    type: 'credit' as const,
    amount: 300,
    description: 'Purchased Upcoins',
    date: '2024-01-01T10:00:00Z',
    status: 'completed',
    paymentMethod: 'Debit Card',
  },
];

const pendingTransactions = [
  {
    id: 'pending-1',
    type: 'credit' as const,
    amount: 150,
    description: 'Upcoin purchase pending verification',
    date: '2024-01-14T12:00:00Z',
    status: 'pending',
    estimatedCompletion: '2024-01-15T12:00:00Z',
  },
  {
    id: 'pending-2',
    type: 'debit' as const,
    amount: 65,
    description: 'React Performance Optimization enrollment',
    date: '2024-01-14T10:30:00Z',
    status: 'processing',
    estimatedCompletion: '2024-01-14T18:00:00Z',
  },
];

const addFundsOptions = [
  { amount: 100, bonus: 0, popular: false },
  { amount: 250, bonus: 15, popular: true },
  { amount: 500, bonus: 50, popular: false },
  { amount: 1000, bonus: 120, popular: false },
];

export const StudentWallet: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [customAmount, setCustomAmount] = useState('');
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  const handleAddFunds = (amount: number, bonus: number = 0) => {
    toast({
      title: 'Funds Added Successfully!',
      description: `${amount + bonus} Upcoins have been added to your wallet.`,
    });
    setIsAddFundsOpen(false);
    setCustomAmount('');
  };

  const TransactionItem = ({ transaction, isPending = false }: { transaction: any; isPending?: boolean }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          transaction.type === 'credit' 
            ? 'bg-success/10 text-success' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {transaction.type === 'credit' ? (
            <ArrowDownLeft className="w-5 h-5" />
          ) : (
            <ArrowUpRight className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">{transaction.description}</p>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{new Date(transaction.date).toLocaleDateString()}</span>
            {isPending && (
              <>
                <Clock className="w-3 h-3" />
                <span className="capitalize">{transaction.status}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${
          transaction.type === 'credit' ? 'text-success' : 'text-destructive'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} UC
        </p>
        {isPending ? (
          <Badge variant="outline" className="text-xs">
            {transaction.status}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your Upcoins and track your spending
          </p>
        </div>
        <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Upcoins</DialogTitle>
              <DialogDescription>
                Choose an amount to add to your wallet. Larger amounts include bonus Upcoins!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {addFundsOptions.map((option) => (
                  <Button
                    key={option.amount}
                    variant={option.popular ? "default" : "outline"}
                    className={`h-auto p-4 flex-col space-y-1 ${option.popular ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleAddFunds(option.amount, option.bonus)}
                  >
                    <span className="text-lg font-bold">{option.amount} UC</span>
                    {option.bonus > 0 && (
                      <span className="text-xs text-success">+{option.bonus} bonus</span>
                    )}
                    {option.popular && (
                      <Badge className="text-xs">Popular</Badge>
                    )}
                  </Button>
                ))}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or custom amount</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom Amount</Label>
                <div className="flex space-x-2">
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleAddFunds(parseInt(customAmount) || 0)}
                    disabled={!customAmount || parseInt(customAmount) <= 0}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated bg-gradient-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{walletData.balance} UC</div>
            <p className="text-xs opacity-75 mt-1">
              Available for spending
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletData.totalSpent} UC</div>
            <p className="text-xs text-muted-foreground">
              On lectures and courses
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{walletData.totalEarned} UC</div>
            <p className="text-xs text-muted-foreground">
              From purchases and bonuses
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{walletData.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Transactions processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTransactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Spending Insights */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Spending Insights</CardTitle>
              <CardDescription>
                Your monthly spending patterns and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Spending</span>
                  <span className="text-sm">{walletData.totalSpent} / {walletData.monthlyLimit} UC</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(walletData.totalSpent / walletData.monthlyLimit) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You have {walletData.monthlyLimit - walletData.totalSpent} UC remaining this month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest wallet activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setSelectedTab('transactions')}
              >
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete history of your wallet transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingTransactions.length > 0 ? (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>
                  Transactions currently being processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTransactions.map((transaction) => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction} 
                      isPending={true}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-elevated">
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All transactions processed</h3>
                <p className="text-muted-foreground">
                  You don't have any pending transactions at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};