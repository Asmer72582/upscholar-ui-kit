import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const AdminSupport = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate ticket submission
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Support ticket submitted successfully!",
        variant: "default"
      });
      setSubject('');
      setMessage('');
      setSelectedPriority('medium');
      setIsSubmitting(false);
    }, 1500);
  };

  const stats = [
    { label: 'Total Tickets', value: '156', icon: Mail, trend: '+12%' },
    { label: 'Open Tickets', value: '23', icon: AlertCircle, trend: '-5%' },
    { label: 'Resolved Today', value: '8', icon: CheckCircle, trend: '+2%' },
    { label: 'Avg Response Time', value: '2.4h', icon: Clock, trend: '-15%' }
  ];

  const recentTickets = [
    { id: 'TKT-001', subject: 'Payment issue', status: 'open', priority: 'high', user: 'John Doe', createdAt: '2 hours ago' },
    { id: 'TKT-002', subject: 'Lecture access problem', status: 'in-progress', priority: 'medium', user: 'Jane Smith', createdAt: '4 hours ago' },
    { id: 'TKT-003', subject: 'Refund request', status: 'resolved', priority: 'low', user: 'Bob Johnson', createdAt: '1 day ago' }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      'in-progress': 'secondary',
      resolved: 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants] || 'default'}>{priority}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support Management</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          System Operational
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.trend}
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="submit">Submit Ticket</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Support Tickets</CardTitle>
              <CardDescription>
                Manage and respond to user support requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.id} • {ticket.user} • {ticket.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Support Ticket</CardTitle>
              <CardDescription>
                Create a support ticket on behalf of a user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Detailed description of the issue..."
                    className="w-full min-h-[120px]"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Analytics</CardTitle>
              <CardDescription>
                Overview of support metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analytics data will be available here</p>
                <p className="text-sm mt-2">Support metrics and trends will be displayed once there's sufficient data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};