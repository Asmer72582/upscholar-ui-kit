import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GraduationCap, UserCheck, Users, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password, selectedRole);
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in to your account.',
        });
      } else {
        await register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          selectedRole
        );
        toast({
          title: 'Account created!',
          description: 'Welcome to Upscholer. Your learning journey begins now.',
        });
      }
      navigate(`/${selectedRole}/dashboard`);
    } catch (error) {
      toast({
        title: 'Authentication Error',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>

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
    </div>
  );
};