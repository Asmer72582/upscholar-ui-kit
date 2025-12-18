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
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const Support = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
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
        description: "Your support ticket has been submitted. We'll get back to you soon!",
        variant: "default"
      });
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 1500);
  };

  const faqItems = [
    {
      question: "How do I join a lecture?",
      answer: "You can join a lecture by going to 'My Lectures' and clicking on the 'Join' button when the lecture is live."
    },
    {
      question: "How do I purchase UpCoins?",
      answer: "Go to your wallet and click on 'Buy UpCoins' to purchase coins using various payment methods."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept credit/debit cards, UPI, and other popular payment methods through our secure payment gateway."
    },
    {
      question: "How do I become a trainer?",
      answer: "Contact our support team to apply for a trainer account. You'll need to provide relevant qualifications and experience."
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Available 24/7
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Get Help
            </CardTitle>
            <CardDescription>
              We're here to help you with any questions or issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@upscholar.in</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Response Time</p>
                <p className="text-sm text-muted-foreground">Usually within 2-4 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">FAQs</p>
                <p className="text-sm text-muted-foreground">Check common questions below</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Submit a Ticket
            </CardTitle>
            <CardDescription>
              Send us your question and we'll get back to you
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
                  placeholder="Brief description of your issue"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide details about your issue..."
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
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Check these common questions before submitting a ticket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <span className="text-primary">Q:</span>
                  {item.question}
                </h3>
                <p className="text-muted-foreground ml-6">
                  <span className="text-primary font-medium">A:</span>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};