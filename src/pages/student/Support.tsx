import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, HelpCircle, CheckCircle, Send, Loader2, AlertCircle } from 'lucide-react';
import { supportService } from '@/services/supportService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const Support = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    try {
      setSending(true);
      await supportService.sendSupportRequest({
        subject: subject.trim(),
        message: message.trim(),
        category: category
      });
      
      toast.success('Support request sent successfully! We will respond within 2-4 hours.');
      setSubject('');
      setMessage('');
      setCategory(undefined);
    } catch (error: any) {
      console.error('Error sending support request:', error);
      toast.error(error.message || 'Failed to send support request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Available 24/7
        </Badge>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Support Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">Contact Support</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={category || undefined} onValueChange={(value) => setCategory(value || undefined)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing & Payment</SelectItem>
                    <SelectItem value="account">Account Issue</SelectItem>
                    <SelectItem value="lecture">Lecture Related</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide details about your issue or question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  required
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Include as much detail as possible to help us assist you better.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Your request will be sent to:</p>
                    <p className="font-mono">support@upscholar.in</p>
                    <p className="mt-2 text-blue-700 dark:text-blue-400">
                      We typically respond within 2-4 hours during business days.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={sending || !subject.trim() || !message.trim()}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Support Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Direct Email Option */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Or Email Us Directly</CardTitle>
            <CardDescription>
              Prefer to send an email directly? Use the link below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Email us at</p>
                <a 
                  href="mailto:support@upscholar.in?subject=Support Request&body=Hello,%0D%0A%0D%0A" 
                  className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  support@upscholar.in
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
