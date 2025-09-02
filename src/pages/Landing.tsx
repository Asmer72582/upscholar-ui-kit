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
  Coins
} from 'lucide-react';

const featuredLectures = [
  {
    id: 1,
    title: 'Introduction to React Hooks',
    trainer: 'Jane Smith',
    price: 50,
    duration: 90,
    rating: 4.8,
    enrolled: 156,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Advanced TypeScript Patterns',
    trainer: 'Mike Johnson',
    price: 75,
    duration: 120,
    rating: 4.9,
    enrolled: 89,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'UI/UX Design Principles',
    trainer: 'Sarah Wilson',
    price: 60,
    duration: 105,
    rating: 4.7,
    enrolled: 203,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
  },
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-secondary" />
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Learn from the Best{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Trainers
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-slide-up">
              Join thousands of learners on Upscholer. Access live lectures, interactive courses, 
              and expert-led sessions. Pay with Upcoins for seamless learning experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button asChild size="lg" className="btn-primary text-lg px-8 py-3">
                <Link to="/auth">
                  Start Learning
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 hover-scale">
                <Link to="/browse">
                  Browse Lectures
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Upscholer?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of online learning with our innovative platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-elevated text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Live Interactive Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Join real-time lectures with expert trainers. Ask questions, participate in discussions, 
                  and learn alongside peers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Upcoin Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Earn and spend Upcoins - our native currency. Get rewarded for engagement 
                  and use coins for premium content.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Expert Trainers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Learn from industry professionals and certified experts. 
                  Access personalized guidance and mentorship.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Lectures */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Lectures
            </h2>
            <p className="text-xl text-muted-foreground">
              Join these popular sessions and start your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredLectures.map((lecture) => (
              <Card key={lecture.id} className="card-elevated overflow-hidden">
                <div className="relative">
                  <img 
                    src={lecture.thumbnail} 
                    alt={lecture.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                    {lecture.price} Upcoins
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{lecture.title}</CardTitle>
                  <CardDescription>
                    by {lecture.trainer}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {lecture.duration} min
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {lecture.rating}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {lecture.enrolled}
                    </div>
                  </div>
                  <Button className="w-full btn-primary">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners and trainers on Upscholer today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3 hover-scale">
              <Link to="/auth">
                Join as Student
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-primary">
              <Link to="/auth">
                Become a Trainer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Upscholer
              </span>
            </div>
            <p className="text-muted-foreground">
              © 2024 Upscholer. All rights reserved. Empowering learners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};