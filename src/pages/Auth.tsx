import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, UserCheck, Users, Shield, Mail, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { API_URL } from '@/config/env';

const roleOptions = [
  {
    value: 'student' as UserRole,
    label: 'Student',
    description: 'Learn from expert trainers',
    icon: UserCheck,
  },
  {
    value: 'trainer' as UserRole,
    label: 'Trainer',
    description: 'Teach and earn with your expertise',
    icon: Users,
  },
  {
    value: 'admin' as UserRole,
    label: 'Admin',
    description: 'Manage platform operations',
    icon: Shield,
  },
];

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [trainerData, setTrainerData] = useState({
    resumeFile: null as File | null,
    demoVideoUrl: '',
    expertise: [] as string[],
    experience: 0,
    bio: '',
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation for trainer registration
    if (!isLogin && selectedRole === 'trainer') {
      if (!trainerData.resumeFile) {
        toast({
          title: 'Missing Resume',
          description: 'Please upload your resume file.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      if (!trainerData.demoVideoUrl || !trainerData.bio || trainerData.expertise.length === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all trainer-specific fields.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password, selectedRole);
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in to your account.',
        });
        navigate(`/${selectedRole}/dashboard`);
      } else {
        const result = await register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          selectedRole,
          selectedRole === 'trainer' ? trainerData : undefined
        );
        
        if (result.isTrainer) {
          // Navigate to success page for trainers
          navigate('/trainer-application-success', { 
            state: { 
              email: formData.email,
              message: result.message 
            } 
          });
          return;
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to Upscholer. Your learning journey begins now.',
          });
          navigate(`/${selectedRole}/dashboard`);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTrainerDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTrainerData(prev => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrainerData(prev => ({
        ...prev,
        resumeFile: file,
      }));
    }
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !trainerData.expertise.includes(expertiseInput.trim())) {
      setTrainerData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertiseInput.trim()]
      }));
      setExpertiseInput('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setTrainerData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }));
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingResetEmail(true);
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      toast({
        title: 'Email Sent',
        description: data.message,
      });

      setForgotPasswordOpen(false);
      setForgotPasswordEmail('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSendingResetEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Upscholer
              </span>
            </Link>
          </div>

          <Card className="card-elevated">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'Welcome Back' : 'Join Upscholer'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Sign in to continue your learning journey' 
                  : 'Create your account and start learning'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Role Selection */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Select your role</Label>
                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`p-3 rounded-lg border text-center transition-all hover-scale ${
                          selectedRole === role.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{role.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                  />
                </div>

                {/* Password field - for login (all roles) or student registration */}
                {(isLogin || (!isLogin && selectedRole === 'student')) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {isLogin && (
                        <Button
                          type="button"
                          variant="link"
                          className="text-xs px-0 h-auto"
                          onClick={() => setForgotPasswordOpen(true)}
                        >
                          Forgot Password?
                        </Button>
                      )}
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                    />
                    {!isLogin && formData.password && formData.password.length < 6 && (
                      <p className="text-sm text-red-500">Password must be at least 6 characters long</p>
                    )}
                  </div>
                )}

                {/* Trainer-specific fields */}
                {!isLogin && selectedRole === 'trainer' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resumeFile">Upload Resume/CV</Label>
                      <Input
                        id="resumeFile"
                        name="resumeFile"
                        type="file"
                        required
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload your resume in PDF, DOC, or DOCX format (max 5MB)
                      </p>
                      {trainerData.resumeFile && (
                        <p className="text-sm text-green-600">
                          Selected: {trainerData.resumeFile.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="demoVideoUrl">Demo Video URL (60 seconds max)</Label>
                      <Input
                        id="demoVideoUrl"
                        name="demoVideoUrl"
                        type="url"
                        required
                        value={trainerData.demoVideoUrl}
                        onChange={handleTrainerDataChange}
                        placeholder="https://youtube.com/watch?v=your-demo-video"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a 60-second demo video to YouTube, Vimeo, or cloud storage
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        required
                        min="0"
                        max="50"
                        value={trainerData.experience}
                        onChange={handleTrainerDataChange}
                        placeholder="5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Areas of Expertise</Label>
                      <div className="flex gap-2">
                        <Input
                          value={expertiseInput}
                          onChange={(e) => setExpertiseInput(e.target.value)}
                          placeholder="e.g., JavaScript, React, Node.js"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                        />
                        <Button type="button" onClick={addExpertise} variant="outline" size="sm">
                          Add
                        </Button>
                      </div>
                      {trainerData.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {trainerData.expertise.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeExpertise(skill)}
                                className="text-primary/70 hover:text-primary"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio (max 500 characters)</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        required
                        maxLength={500}
                        value={trainerData.bio}
                        onChange={handleTrainerDataChange}
                        placeholder="Tell us about yourself, your teaching style, and what makes you a great trainer..."
                        className="min-h-[100px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {trainerData.bio.length}/500 characters
                      </p>
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full btn-primary" 
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'
                  }
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                  ← Back to home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Forgot Password
            </DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email Address</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                disabled={sendingResetEmail}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setForgotPasswordOpen(false);
                setForgotPasswordEmail('');
              }}
              disabled={sendingResetEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPassword}
              disabled={sendingResetEmail || !forgotPasswordEmail}
            >
              {sendingResetEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};