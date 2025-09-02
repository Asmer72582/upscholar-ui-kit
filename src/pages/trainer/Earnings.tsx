import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, BookOpen, Download, CreditCard, Wallet } from 'lucide-react';

const earningsData = {
  totalEarnings: 12450,
  monthlyEarnings: 2890,
  pendingPayouts: 1250,
  availableBalance: 11200,
  transactions: [
    {
      id: 'TXN-001',
      type: 'lecture',
      description: 'React Hooks Lecture',
      amount: 50,
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 'TXN-002',
      type: 'course',
      description: 'Complete React Masterclass',
      amount: 299,
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: 'TXN-003',
      type: 'withdrawal',
      description: 'Bank Transfer',
      amount: -500,
      date: '2024-01-12',
      status: 'processing'
    },
    {
      id: 'TXN-004',
      type: 'lecture',
      description: 'TypeScript Advanced Patterns',
      amount: 75,
      date: '2024-01-10',
      status: 'completed'
    }
  ],
  analytics: {
    totalStudents: 456,
    activeCourses: 3,
    averageRating: 4.8,
    conversionRate: 12.5
  }
};

export const Earnings: React.FC = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const handleWithdraw = () => {
    console.log('Withdrawal requested:', withdrawAmount);
    setWithdrawAmount('');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className="w-4 h-4" />;
      case 'course':
        return <Users className="w-4 h-4" />;
      case 'withdrawal':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Earnings & Wallet</h1>
        <p className="text-muted-foreground">Manage your income and withdrawals</p>
      </div>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">{earningsData.totalEarnings}</p>
                  <p className="text-xs text-muted-foreground">Upcoins</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{earningsData.monthlyEarnings}</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">{earningsData.availableBalance}</p>
                  <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{earningsData.analytics.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Total enrolled</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>Your recent earnings and withdrawals</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {earningsData.transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(transaction.type)}
                                <span className="capitalize">{transaction.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount} Upcoins
                            </TableCell>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Analytics</CardTitle>
                      <CardDescription>Your teaching performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-primary">{earningsData.analytics.averageRating}</p>
                          <p className="text-sm text-muted-foreground">Average Rating</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-primary">{earningsData.analytics.conversionRate}%</p>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Complete React Masterclass</span>
                          <span className="font-medium">156 enrollments</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Advanced TypeScript</span>
                          <span className="font-medium">89 enrollments</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>UI/UX Fundamentals</span>
                          <span className="font-medium">211 enrollments</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Withdraw Money */}
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Earnings</CardTitle>
                <CardDescription>
                  Transfer your Upcoins to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-amount">Amount (Upcoins)</Label>
                  <Input 
                    id="withdraw-amount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    max={earningsData.availableBalance}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {earningsData.availableBalance} Upcoins
                  </p>
                </div>
                
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Exchange Rate</span>
                    <span>1 Upcoin = $1.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span>2.5%</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>You'll receive</span>
                    <span>${withdrawAmount ? (parseFloat(withdrawAmount) * 0.975).toFixed(2) : '0.00'}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw} 
                  className="w-full"
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) > earningsData.availableBalance}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Withdrawals typically process within 3-5 business days
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Courses</span>
                    <span className="font-medium">{earningsData.analytics.activeCourses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Students</span>
                    <span className="font-medium">{earningsData.analytics.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending Payouts</span>
                    <span className="font-medium">{earningsData.pendingPayouts} Upcoins</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};