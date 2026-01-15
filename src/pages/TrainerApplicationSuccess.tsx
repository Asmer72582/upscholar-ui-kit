import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock, GraduationCap } from "lucide-react";

export const TrainerApplicationSuccess: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10  rounded-xl flex items-center justify-center shadow-lg">
            <img src="/src/assets/logo.png" alt="Upscholar Logo" className="w-10 h-10 text-white object-contain" />
          </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Upscholar
              </span>
            </Link>
          </div>

          <Card className="card-elevated animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500 delay-300">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">
                Application Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-lg">
                Thank you for applying to become a trainer on Upscholar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Main Message */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2 text-lg">
                      Your trainer application has been submitted successfully!
                    </h3>
                    <p className="text-green-700 leading-relaxed">
                      You will receive an email once your application is
                      reviewed. Please check your email for updates.
                    </p>
                    {email && (
                      <div className="mt-3 p-3 bg-white/60 rounded-md border border-green-100">
                        <p className="text-sm text-green-700">
                          📧 We'll send updates to:{" "}
                          <span className="font-medium text-green-800">
                            {email}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  What happens next?
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Application Review
                      </p>
                      <p className="text-sm text-gray-600">
                        Our team will review your application, resume, and demo
                        video within 2-3 business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Email Notification
                      </p>
                      <p className="text-sm text-gray-600">
                        You'll receive an email with the decision and next
                        steps.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Account Activation
                      </p>
                      <p className="text-sm text-gray-600">
                        If approved, you'll receive login credentials to access
                        your trainer dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs text-blue-600">!</span>
                  </span>
                  Important Notes:
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">📧</span>
                    Please check your spam/junk folder for our emails
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✅</span>
                    Make sure to whitelist hr@upscholar.in
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">🔒</span>
                    You cannot login until your application is approved
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">💬</span>
                    Contact support@upscholar.in if you have questions
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link to="/">Return to Home</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/auth">Back to Login</Link>
                </Button>
              </div>

              {/* Contact Support */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Have questions about your application?{" "}
                  <a
                    href="mailto:support@upscholer.com"
                    className="text-primary hover:underline font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
