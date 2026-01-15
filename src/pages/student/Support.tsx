import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, HelpCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Support = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Available 24/7
        </Badge>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-2xl">Need Assistance?</CardTitle>
            <CardDescription className="text-lg">
              We're here to help you with any questions or issues you may have.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-12">
            <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Email us at</p>
                <a 
                  href="mailto:support@upscholar.in" 
                  className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  support@upscholar.in
                </a>
              </div>
            </div>
            
            <p className="text-center text-muted-foreground">
              Our support team typically responds within 2-4 hours during business days.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
