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
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Learn from Expert{' '}
              <span className="text-primary">Trainers</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join live lectures and interactive courses. Pay with Upcoins for seamless learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/auth">
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">
                  Browse Lectures
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Upscholer?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Live Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Interactive lectures with expert trainers
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Upcoin Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Earn and spend our native currency
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Expert Trainers</h3>
              <p className="text-sm text-muted-foreground">
                Learn from industry professionals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Lectures */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Popular Lectures</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredLectures.map((lecture) => (
              <Card key={lecture.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={lecture.thumbnail} 
                    alt={lecture.title}
                    className="w-full h-40 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 text-xs">
                    {lecture.price} Upcoins
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{lecture.title}</CardTitle>
                  <CardDescription className="text-xs">
                    by {lecture.trainer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{lecture.duration}min</span>
                    <span>★ {lecture.rating}</span>
                    <span>{lecture.enrolled} enrolled</span>
                  </div>
                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="secondary">
              <Link to="/auth">
                Join as Student
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Link to="/auth">
                Become a Trainer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-primary">Upscholer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Upscholer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};