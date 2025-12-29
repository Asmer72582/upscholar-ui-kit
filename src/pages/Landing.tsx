import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap,
  Video,
  MapPin,
  ArrowRight,
  Users,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  Star,
  Building2,
  Wifi,
  BookOpen
} from 'lucide-react';

// Offline Centre Details
const offlineCentres = [
  {
    name: 'Upscholar Learning Hub - Mumbai',
    address: '123 Education Street, Andheri West, Mumbai - 400053',
    phone: '+91 98765 43210',
    email: 'mumbai@upscholar.com',
    timings: 'Mon-Sat: 8:00 AM - 8:00 PM',
    features: ['AC Classrooms', 'Computer Lab', 'Library', 'Doubt Sessions'],
    subjects: ['Mathematics', 'Science', 'English', 'Competitive Exams'],
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop'
  },
  {
    name: 'Upscholar Academy - Delhi',
    address: '456 Knowledge Park, Connaught Place, New Delhi - 110001',
    phone: '+91 98765 43211',
    email: 'delhi@upscholar.com',
    timings: 'Mon-Sat: 7:00 AM - 9:00 PM',
    features: ['Smart Classrooms', 'Science Lab', 'Sports Facility', 'Hostel Available'],
    subjects: ['IIT-JEE', 'NEET', 'Board Exams', 'Foundation Courses'],
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop'
  },
  {
    name: 'Upscholar Institute - Bangalore',
    address: '789 Tech Avenue, Koramangala, Bangalore - 560034',
    phone: '+91 98765 43212',
    email: 'bangalore@upscholar.com',
    timings: 'Mon-Sun: 6:00 AM - 10:00 PM',
    features: ['Modern Infrastructure', 'Digital Library', 'Cafeteria', 'Transport'],
    subjects: ['Programming', 'Data Science', 'Web Development', 'School Subjects'],
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop'
  }
];

export const Landing: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showOfflineCentres, setShowOfflineCentres] = useState(false);

  useEffect(() => {
    // Redirect logged-in users to their dashboard
    if (!loading && user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Upscholar
              </span>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link to="/auth">
                Login / Register
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        {!showOfflineCentres ? (
          /* Main Selection Screen */
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <Badge className="mb-6 px-4 py-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                <Star className="w-4 h-4 mr-2" />
                Welcome to Upscholar
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Learn with the Best
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Anytime, Anywhere
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose your preferred mode of learning. We offer both online interactive classes 
                and offline coaching centres across India.
              </p>
            </div>

            {/* Two Options */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Online Teaching Card */}
              <Card className="group relative overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl cursor-pointer bg-white"
                    onClick={() => navigate('/auth')}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
                <CardHeader className="relative pb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Video className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    Online Teaching
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Live interactive classes from expert trainers
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Live interactive video classes</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Learn from anywhere, anytime</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>1000 Free UpCoins on signup!</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Expert trainers & doubt sessions</span>
                    </li>
                  </ul>
                  <Button className="w-full py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 group-hover:shadow-lg transition-all">
                    <Wifi className="w-5 h-5 mr-2" />
                    Start Learning Online
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              {/* Offline Centres Card */}
              <Card className="group relative overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all duration-500 hover:shadow-2xl cursor-pointer bg-white"
                    onClick={() => setShowOfflineCentres(true)}>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-500" />
                <CardHeader className="relative pb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    Offline Centres
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Physical coaching centres across India
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Physical classroom experience</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Face-to-face interaction with teachers</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Modern facilities & labs</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>Multiple locations across India</span>
                    </li>
                  </ul>
                  <Button className="w-full py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 group-hover:shadow-lg transition-all">
                    <MapPin className="w-5 h-5 mr-2" />
                    View Our Centres
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <div className="text-3xl font-bold text-indigo-600 mb-1">15,000+</div>
                <div className="text-gray-600">Students</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-1">500+</div>
                <div className="text-gray-600">Expert Trainers</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <div className="text-3xl font-bold text-orange-600 mb-1">50+</div>
                <div className="text-gray-600">Subjects</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-1">4.9/5</div>
                <div className="text-gray-600">Rating</div>
              </div>
            </div>
          </div>
        ) : (
          /* Offline Centres Details */
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                className="mb-8 text-gray-600 hover:text-gray-900"
                onClick={() => setShowOfflineCentres(false)}
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Home
              </Button>

              <div className="text-center mb-12">
                <Badge className="mb-4 px-4 py-2 bg-orange-100 text-orange-700 border-orange-200">
                  <Building2 className="w-4 h-4 mr-2" />
                  Our Physical Centres
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Upscholar Offline Centres
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Visit our state-of-the-art coaching centres for an immersive learning experience
                </p>
              </div>

              {/* Centres Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {offlineCentres.map((centre, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48">
                      <img 
                        src={centre.image} 
                        alt={centre.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900">
                        <MapPin className="w-3 h-3 mr-1" />
                        {centre.name.split(' - ')[1]}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{centre.name}</CardTitle>
                      <CardDescription className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                        {centre.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-indigo-500" />
                          {centre.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-indigo-500" />
                          {centre.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          {centre.timings}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Facilities:</p>
                        <div className="flex flex-wrap gap-2">
                          {centre.features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Subjects */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Courses Offered:</p>
                        <div className="flex flex-wrap gap-2">
                          {centre.subjects.map((subject, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Centre
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Also Offer Online */}
              <div className="mt-16 text-center p-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
                <h2 className="text-2xl font-bold mb-4">Prefer Online Learning?</h2>
                <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                  Can't visit our centres? Join our online platform and learn from the same expert trainers from anywhere!
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                  onClick={() => navigate('/auth')}
                >
                  <Wifi className="w-5 h-5 mr-2" />
                  Start Online Learning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Upscholar</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>© 2024 Upscholar</span>
                <span>•</span>
                <span>All rights reserved</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
