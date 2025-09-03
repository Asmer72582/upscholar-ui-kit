import React, { useState, useEffect } from 'react';
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
  Quote,
  Zap,
  Target,
  Globe,
  Rocket,
  Brain,
  Heart,
  Shield,
  Sparkles,
  ChevronRight,
  Eye,
  Timer,
  Trophy
} from 'lucide-react';

const stats = [
  { number: '15,000+', label: 'Students Enrolled', icon: Users, color: 'text-blue-500' },
  { number: '500+', label: 'Expert Trainers', icon: Award, color: 'text-green-500' },
  { number: '2,000+', label: 'Live Sessions', icon: Video, color: 'text-purple-500' },
  { number: '4.9/5', label: 'Average Rating', icon: Star, color: 'text-yellow-500' },
];

const liveStats = [
  { value: 127, label: 'Live Sessions Now', trend: '+12%', icon: Video },
  { value: 3421, label: 'Active Learners', trend: '+24%', icon: Users },
  { value: 89, label: 'New Signups Today', trend: '+8%', icon: TrendingUp },
];

const howItWorks = [
  {
    step: '01',
    title: 'Discover & Browse',
    description: 'AI-powered recommendations match you with perfect courses from our expert trainers',
    icon: Brain,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    step: '02',
    title: 'Secure Payment',
    description: 'Seamless Upcoin transactions with blockchain security and instant processing',
    icon: Shield,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    step: '03',
    title: 'Live Interaction',
    description: 'Real-time learning with HD video, screen sharing, and interactive tools',
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    step: '04',
    title: 'Achievement & Growth',
    description: 'Earn verified certificates and unlock career advancement opportunities',
    icon: Trophy,
    gradient: 'from-orange-500 to-red-500',
  },
];

const features = [
  {
    title: 'AI-Powered Learning Paths',
    description: 'Personalized curriculum that adapts to your learning style and pace',
    icon: Brain,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    title: 'Real-Time Interaction',
    description: 'Live Q&A, polls, and collaborative exercises with instructors',
    icon: Video,
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    title: 'Global Community',
    description: 'Connect with learners and experts from around the world',
    icon: Globe,
    color: 'bg-green-500/10 text-green-500',
  },
  {
    title: 'Instant Recognition',
    description: 'Blockchain-verified certificates recognized by top companies',
    icon: Award,
    color: 'bg-orange-500/10 text-orange-500',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Senior Software Engineer at Google',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b832?w=100&h=100&fit=crop&crop=face',
    content: 'The live sessions are incredibly engaging. I mastered React architecture in just 3 weeks and got promoted within 2 months!',
    rating: 5,
    achievement: '+40% salary increase',
    company: 'Google',
  },
  {
    name: 'Michael Chen',
    role: 'VP Product at Stripe',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    content: 'Revolutionary platform! The AI-powered learning paths and real-time collaboration changed how our team learns.',
    rating: 5,
    achievement: 'Led 3 successful launches',
    company: 'Stripe',
  },
  {
    name: 'Emily Davis',
    role: 'Design Director at Figma',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: 'The design thinking courses here are world-class. Perfect balance of theory and hands-on practice.',
    rating: 5,
    achievement: 'Built design system',
    company: 'Figma',
  },
  {
    name: 'David Rodriguez',
    role: 'ML Engineer at OpenAI',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'The ML courses are cutting-edge. Direct access to industry experts made all the difference in my career.',
    rating: 5,
    achievement: 'Published 3 papers',
    company: 'OpenAI',
  },
];

const featuredLectures = [
  {
    id: 1,
    title: 'Advanced React Patterns & Architecture',
    trainer: 'Alex Thompson',
    trainerTitle: 'Former Meta Senior Engineer',
    price: 75,
    duration: 120,
    rating: 4.9,
    enrolled: 1234,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    level: 'Advanced',
    isLive: true,
    nextSession: '2 hours',
    category: 'Development',
    tags: ['React', 'Architecture', 'Performance'],
  },
  {
    id: 2,
    title: 'AI & Machine Learning Masterclass',
    trainer: 'Dr. Maria Rodriguez',
    trainerTitle: 'AI Research Scientist at Google',
    price: 120,
    duration: 180,
    rating: 4.9,
    enrolled: 892,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    level: 'Intermediate',
    isLive: false,
    nextSession: '6 hours',
    category: 'AI/ML',
    tags: ['Python', 'TensorFlow', 'Neural Networks'],
  },
  {
    id: 3,
    title: 'Product Design System Workshop',
    trainer: 'James Wilson',
    trainerTitle: 'Design Director at Airbnb',
    price: 85,
    duration: 150,
    rating: 4.8,
    enrolled: 567,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    level: 'Intermediate',
    isLive: true,
    nextSession: '4 hours',
    category: 'Design',
    tags: ['Figma', 'Design Systems', 'UI/UX'],
  },
];

export const Landing: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-bounce delay-500"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Live Activity Bar */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">
                  127 live sessions happening now
                </span>
              </div>
            </div>

            <Badge variant="secondary" className="mb-6 px-6 py-2 text-sm bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              New: AI-Powered Learning Paths & Real-time Collaboration
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your Future with{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                Live Learning
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Join interactive live sessions with world-class experts. Master in-demand skills, earn verified certificates, and accelerate your career with our revolutionary blockchain-powered platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button asChild size="lg" className="text-lg px-10 py-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <Link to="/auth">
                  <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 rounded-xl border-2 hover:bg-primary/5 transition-all duration-300 group">
                <Link to="/auth">
                  <Eye className="w-6 h-6 mr-3" />
                  Explore 2000+ Sessions
                  <ChevronRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            
            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 ${stat.color} mx-auto mb-3 p-2 rounded-xl bg-background/80`}>
                    <stat.icon className="w-full h-full" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time Activity Feed */}
            <div className="mt-16 max-w-3xl mx-auto">
              <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                  <Timer className="w-5 h-5 text-primary" />
                  Live Activity Feed
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {liveStats.map((item, index) => (
                    <div key={index} className="text-center p-4 rounded-xl bg-background/50">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <item.icon className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold">{item.value}</span>
                        <Badge variant="secondary" className="text-xs text-green-600 bg-green-500/10">
                          {item.trend}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">
              <Target className="w-4 h-4 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How Upscholer Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Four powerful steps to transform your learning journey and accelerate your career growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative text-center group">
                {/* Connection Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0"></div>
                )}
                
                <div className="relative z-10">
                  <div className="relative mb-8">
                    <div className={`w-24 h-24 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-2xl`}>
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-background border-4 border-primary text-primary rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Upscholer?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of education with cutting-edge technology and world-class instructors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lectures */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Video className="w-4 h-4 mr-2" />
              Hot Topics
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Trending Live Sessions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of learners in our most popular sessions taught by industry leaders
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredLectures.map((lecture, index) => (
              <Card key={lecture.id} className={`overflow-hidden hover:shadow-2xl transition-all duration-500 group border-0 bg-card/80 backdrop-blur-sm ${index === 0 ? 'lg:scale-105 border-2 border-primary/20' : ''}`}>
                <div className="relative">
                  <img 
                    src={lecture.thumbnail} 
                    alt={lecture.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Live Badge */}
                  {lecture.isLive && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <Badge className="absolute top-4 right-4 bg-background/95 text-foreground border-0">
                    {lecture.category}
                  </Badge>
                  
                  {/* Level Badge */}
                  <Badge variant="secondary" className="absolute bottom-4 left-4">
                    {lecture.level}
                  </Badge>
                  
                  {/* Price Badge */}
                  <Badge className="absolute bottom-4 right-4 bg-gradient-to-r from-primary to-primary/80 text-white border-0">
                    {lecture.price} Upcoins
                  </Badge>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button size="lg" className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                      <Play className="w-6 h-6 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    Next session in {lecture.nextSession}
                  </div>
                  <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                    {lecture.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    by <span className="font-semibold text-foreground">{lecture.trainer}</span>
                    <br />
                    <span className="text-sm text-muted-foreground">{lecture.trainerTitle}</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lecture.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{lecture.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{lecture.enrolled.toLocaleString()} enrolled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{lecture.duration} min</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    {lecture.isLive ? 'Join Live Now' : 'Reserve Spot'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Transforming Careers Worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of professionals who accelerated their careers with Upscholer
            </p>
          </div>

          {/* Featured Testimonial */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-2 border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <Quote className="w-16 h-16 text-primary/30 mb-6" />
                <blockquote className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center gap-6">
                  <img 
                    src={testimonials[currentTestimonial].image} 
                    alt={testimonials[currentTestimonial].name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20"
                  />
                  <div>
                    <h4 className="text-xl font-bold">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary" className="text-green-600 bg-green-500/10">
                        {testimonials[currentTestimonial].achievement}
                      </Badge>
                      <span className="text-sm text-muted-foreground">@ {testimonials[currentTestimonial].company}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Testimonial Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className={`p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  index === currentTestimonial ? 'ring-2 ring-primary/30 scale-105' : 'hover:scale-105'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">"{testimonial.content}"</p>
                <Badge variant="secondary" className="mt-3 text-xs text-green-600 bg-green-500/10">
                  {testimonial.achievement}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-10 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-3xl p-8 md:p-16 text-white overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-float delay-0"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full animate-float delay-1000"></div>
                <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-white rounded-full animate-float delay-2000"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Proven Results
                </Badge>
                
                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                  Join the Learning Revolution
                </h2>
                
                <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
                  Transform your career with data-driven results from our global community
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                  <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="text-4xl md:text-5xl font-bold mb-3 text-yellow-300">98%</div>
                    <div className="text-white/90 font-medium">Completion Rate</div>
                    <div className="text-white/70 text-sm mt-1">Industry leading</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="text-4xl md:text-5xl font-bold mb-3 text-green-300">73%</div>
                    <div className="text-white/90 font-medium">Career Growth</div>
                    <div className="text-white/70 text-sm mt-1">Within 6 months</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="text-4xl md:text-5xl font-bold mb-3 text-blue-300">50k+</div>
                    <div className="text-white/90 font-medium">Success Stories</div>
                    <div className="text-white/70 text-sm mt-1">And counting</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="text-4xl md:text-5xl font-bold mb-3 text-purple-300">24/7</div>
                    <div className="text-white/90 font-medium">Expert Support</div>
                    <div className="text-white/70 text-sm mt-1">Always available</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button asChild size="lg" variant="secondary" className="text-lg px-10 py-6 bg-white text-primary hover:bg-white/90 shadow-xl">
                    <Link to="/auth">
                      <Rocket className="w-6 h-6 mr-3" />
                      Start Your Journey Today
                      <Sparkles className="w-5 h-5 ml-3" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg px-10 py-6 text-white border-white/30 hover:bg-white/10">
                    <Link to="/auth">
                      <Award className="w-6 h-6 mr-3" />
                      View Success Stories
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <Badge variant="outline" className="mb-6 px-6 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Limited Time: Free Premium Access
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                Ready to Transform Your{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Future?
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Whether you're looking to master new skills or share your expertise with the world, Upscholer is your gateway to unlimited possibilities.
              </p>
            </div>
            
            {/* Dual Path Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Student Path */}
              <Card className="p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Start Learning</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Access world-class courses, earn certificates, and accelerate your career with personalized learning paths.
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>7-day free premium trial</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>AI-powered learning recommendations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Verified certificates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>24/7 mentor support</span>
                  </li>
                </ul>
                <Button asChild size="lg" className="w-full text-lg py-6">
                  <Link to="/auth">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </Card>

              {/* Trainer Path */}
              <Card className="p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-background">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Become a Trainer</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Share your expertise, build a global audience, and earn premium income with our advanced teaching tools.
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Up to 80% revenue share</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Global marketing support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Professional course creation tools</span>
                  </li>
                </ul>
                <Button asChild variant="secondary" size="lg" className="w-full text-lg py-6">
                  <Link to="/auth">
                    <Award className="w-5 h-5 mr-2" />
                    Apply to Teach
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>15,000+ Happy Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Industry Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>30-Day Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Upscholer
                  </span>
                </div>
                <p className="text-muted-foreground text-lg mb-6 max-w-md leading-relaxed">
                  Transforming education through live, interactive learning experiences. Join millions of learners and experts in the future of education.
                </p>
                <div className="flex gap-4">
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Globe className="w-4 h-4 mr-2" />
                    Global Platform
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Secure & Trusted
                  </Button>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
                <div className="space-y-3">
                  <Link to="#" className="block text-muted-foreground hover:text-primary transition-colors">
                    Browse Courses
                  </Link>
                  <Link to="#" className="block text-muted-foreground hover:text-primary transition-colors">
                    Become a Trainer
                  </Link>
                  <Link to="#" className="block text-muted-foreground hover:text-primary transition-colors">
                    Success Stories
                  </Link>
                  <Link to="#" className="block text-muted-foreground hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Support</h4>
                <div className="space-y-3">
                  <Link to="#" className="block text-muted-foreground hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                  <Link to="#" className="block text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="#" className="block text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                  <Link to="#" className="block text-muted-foreground hover:text-primary transition-colors">
                    Community Guidelines
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-border/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>© 2024 Upscholer. All rights reserved.</span>
                  <span className="hidden md:block">•</span>
                  <span className="flex items-center gap-1">
                    Made with <Heart className="w-4 h-4 text-red-500 animate-pulse" /> for learners worldwide
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Growing Fast
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Award Winning
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};