import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Search, MoreHorizontal, MessageCircle, AlertTriangle, CheckCircle, Clock, Send, Users, Mail } from 'lucide-react';

const supportTickets = [
  {
    id: 'TKT-001',
    user: 'John Smith',
    email: 'john.smith@email.com',
    subject: 'Payment Issue',
    message: 'Unable to purchase Upcoins with my credit card.',
    status: 'open',
    priority: 'high',
    category: 'billing',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'TKT-002',
    user: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    subject: 'Course Access Problem',
    message: 'Cannot access the React course I purchased yesterday.',
    status: 'in-progress',
    priority: 'medium',
    category: 'technical',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-15'
  },
  {
    id: 'TKT-003',
    user: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    subject: 'Refund Request',
    message: 'Would like to request a refund for the UI/UX course.',
    status: 'resolved',
    priority: 'low',
    category: 'billing',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-14'
  }
];

const announcements = [
  {
    id: 1,
    title: 'Platform Maintenance Scheduled',
    content: 'We will be performing scheduled maintenance on January 20th from 2:00 AM to 4:00 AM EST.',
    type: 'maintenance',
    targetAudience: 'all',
    status: 'published',
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    title: 'New Feature: Course Reviews',
    content: 'Students can now leave reviews and ratings for completed courses.',
    type: 'feature',
    targetAudience: 'students',
    status: 'draft',
    createdAt: '2024-01-12'
  }
];

const supportStats = {
  totalTickets: 45,
  openTickets: 12,
  inProgressTickets: 8,
  resolvedTickets: 25,
  avgResponseTime: '2.5 hours'
};

export const AdminSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general',
    targetAudience: 'all'
  });

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-800">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating announcement:', newAnnouncement);
    setNewAnnouncement({ title: '', content: '', type: 'general', targetAudience: 'all' });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">Manage support tickets and user communications</p>
      </div>

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{supportStats.totalTickets}</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{supportStats.openTickets}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">{supportStats.inProgressTickets}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{supportStats.resolvedTickets}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-center">
                <p className="text-2xl font-bold">{supportStats.avgResponseTime}</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast Message</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Support Tickets</CardTitle>
                    <CardDescription>Manage user support requests</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tickets Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.user}</p>
                            <p className="text-sm text-muted-foreground">{ticket.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{ticket.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Announcement</CardTitle>
                  <CardDescription>Share important updates with users</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Announcement title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea 
                        id="content"
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Announcement content..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={newAnnouncement.type} 
                          onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="feature">New Feature</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="audience">Target Audience</Label>
                        <Select 
                          value={newAnnouncement.targetAudience} 
                          onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, targetAudience: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="students">Students Only</SelectItem>
                            <SelectItem value="trainers">Trainers Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Publish Announcement
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                  <CardDescription>Previously published announcements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <Badge variant={announcement.status === 'published' ? 'default' : 'secondary'}>
                            {announcement.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{announcement.type}</Badge>
                          <span>•</span>
                          <span>{announcement.targetAudience}</span>
                          <span>•</span>
                          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="broadcast" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Broadcast Message</CardTitle>
                <CardDescription>Send a message to all users or specific groups</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="broadcast-subject">Subject</Label>
                    <Input 
                      id="broadcast-subject"
                      placeholder="Message subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="broadcast-content">Message</Label>
                    <Textarea 
                      id="broadcast-content"
                      placeholder="Message content..."
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="broadcast-audience">Send To</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">All Students</SelectItem>
                        <SelectItem value="trainers">All Trainers</SelectItem>
                        <SelectItem value="active">Active Users Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Broadcast Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};