import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  GraduationCap,
  Video,
  Coins,
  Play,
  Award,
  TrendingUp,
  Quote
} from 'lucide-react';

const stats = [
  { number: '15,000+', label: 'Students Enrolled' },
  { number: '500+', label: 'Expert Trainers' },
  { number: '2,000+', label: 'Live Sessions' },
  { number: '4.9/5', label: 'Average Rating' },
];

const howItWorks = [
  {
    step: '01',
    title: 'Browse & Choose',
    description: 'Explore thousands of live lectures from expert trainers',
    icon: BookOpen,
  },
  {
    step: '02',
    title: 'Pay with Upcoins',
    description: 'Use our native currency for seamless transactions',
    icon: Coins,
  },
  {
    step: '03',
    title: 'Join Live Sessions',
    description: 'Participate in interactive real-time learning',
    icon: Video,
  },
  {
    step: '04',
    title: 'Earn Certificates',
    description: 'Get recognized for your achievements',
    icon: Award,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Developer',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b832?w=100&h=100&fit=crop&crop=face',
    content: 'The live sessions are incredibly engaging. I learned React in just 3 weeks!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    content: 'Amazing platform with top-quality trainers. The Upcoin system is brilliant.',
    rating: 5,
  },
  {
    name: 'Emily Davis',
    role: 'UI/UX Designer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: 'Perfect for busy professionals. Live learning fits perfectly into my schedule.',
    rating: 5,
  },
];

const featuredLectures = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    trainer: 'Alex Thompson',
    price: 75,
    duration: 120,
    rating: 4.9,
    enrolled: 234,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    level: 'Advanced',
  },
  {
    id: 2,
    title: 'Machine Learning Basics',
    trainer: 'Dr. Maria Rodriguez',
    price: 90,
    duration: 150,
    rating: 4.8,
    enrolled: 189,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    level: 'Beginner',
  },
  {
    id: 3,
    title: 'Product Design Masterclass',
    trainer: 'James Wilson',
    price: 65,
    duration: 90,
    rating: 4.9,
    enrolled: 156,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    level: 'Intermediate',
  },
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              🚀 Now with AI-powered learning paths
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Master Skills Through{' '}
              <span className="text-primary">Live Learning</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join interactive live sessions with world-class instructors. Learn, practice, and succeed with our revolutionary Upcoin system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/auth">
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/auth">
                  Browse 2000+ Sessions
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Upscholer Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to transform your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lectures */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Live Sessions</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of learners in our most popular sessions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredLectures.map((lecture) => (
              <Card key={lecture.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img 
                    src={lecture.thumbnail} 
                    alt={lecture.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                    {lecture.level}
                  </Badge>
                  <Badge className="absolute top-3 right-3">
                    {lecture.price} Upcoins
                  </Badge>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{lecture.title}</CardTitle>
                  <CardDescription>
                    by {lecture.trainer} • {lecture.duration} min
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{lecture.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{lecture.enrolled} enrolled</span>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    Join Live Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied learners who transformed their careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 relative">
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the Learning Revolution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
                <div className="text-white/80">Completion Rate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">45%</div>
                <div className="text-white/80">Career Growth</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">30k+</div>
                <div className="text-white/80">Success Stories</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
                <div className="text-white/80">Support</div>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/auth">
                <TrendingUp className="w-5 h-5 mr-2" />
                Start Your Journey Today
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're looking to learn new skills or share your expertise, Upscholer is your gateway to success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth">
                <GraduationCap className="w-5 h-5 mr-2" />
                Join as Student
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/auth">
                <Users className="w-5 h-5 mr-2" />
                Become a Trainer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary">Upscholer</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Empowering learners worldwide with live, interactive education experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-primary transition-colors">Support</Link>
              <Link to="#" className="hover:text-primary transition-colors">Contact</Link>
            </div>
            <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
              © 2024 Upscholer. All rights reserved. Made with ❤️ for learners everywhere.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};