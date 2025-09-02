import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mail, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I purchase Upcoins?',
    answer: 'You can purchase Upcoins through your wallet page using credit card, debit card, or other supported payment methods.'
  },
  {
    question: 'Can I get a refund for a lecture?',
    answer: 'Yes, you can request a refund within 24 hours of purchase if you haven\'t attended the lecture yet.'
  },
  {
    question: 'How do I join a live lecture?',
    answer: 'Navigate to "My Lectures" and click "Join" when the lecture is live. Make sure you have a stable internet connection.'
  },
  {
    question: 'What if I miss a live lecture?',
    answer: 'Most lectures are recorded and available for replay. Check the lecture details for recording availability.'
  }
];

const tickets = [
  {
    id: 'TKT-001',
    subject: 'Payment Issue',
    status: 'resolved',
    date: '2024-01-10',
    response: 'Your payment has been processed successfully.'
  },
  {
    id: 'TKT-002',
    subject: 'Audio Problem in Lecture',
    status: 'pending',
    date: '2024-01-12',
    response: 'We are investigating the audio issue you reported.'
  }
];

export const Support: React.FC = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Support ticket submitted:', formData);
    setFormData({ subject: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">Get help with your Upscholer experience</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="contact" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contact">Contact Us</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            </TabsList>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Submit a support ticket and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Describe your issue in detail..."
                        rows={5}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Ticket
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find quick answers to common questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>
                    Track your support requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{ticket.subject}</h4>
                            <p className="text-sm text-muted-foreground">Ticket #{ticket.id}</p>
                          </div>
                          <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                            {ticket.status === 'resolved' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{ticket.response}</p>
                        <p className="text-xs text-muted-foreground">{ticket.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@upscholer.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Critical Issues</span>
                <span className="text-sm font-medium">2-4 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">General Support</span>
                <span className="text-sm font-medium">12-24 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Feature Requests</span>
                <span className="text-sm font-medium">2-3 days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};