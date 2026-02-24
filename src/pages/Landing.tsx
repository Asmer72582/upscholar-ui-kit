import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video,
  MapPin,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  BookOpen,
  Building2,
  CheckCircle,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  Star
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

  const BRAND = '#63559e';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900" style={{ fontFamily: "'Montserrat', 'Gotham', sans-serif" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/mainlogo.png" alt="Upscholar Educational Hub" className="h-10 md:h-12 object-contain" />
            </div>
            <Link 
              to="/auth" 
              className="text-gray-600 hover:text-[#63559e] font-medium text-sm md:text-base transition-colors"
            >
              Login or Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {!showOfflineCentres ? (
          <>
            {/* Hero Section */}
            <section className="relative pb-32 pt-16 overflow-hidden">
               {/* Background: use image from public if available */}
               <div className="absolute inset-0 z-0 select-none pointer-events-none">
                 <div 
                   className="w-full h-full bg-no-repeat bg-center bg-cover"
                   style={{ 
                     backgroundImage: `url('/background%20image%201400%20x%20800.jpg'), url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')`,
                     backgroundColor: '#e8e4f0',
                   }}
                 />
                 <div className="absolute inset-0 bg-[#63559e]/20" />
                 <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/90" />
               </div>

               <div className="relative z-10 container mx-auto px-4 text-center">
                  <h1 className="text-4xl md:text-6xl text-gray-900 mb-4 tracking-tight leading-[1.2]">
                    <span className="font-gotham-light font-light" style={{ fontFamily: "'Gotham Light','Gotham-Light','Montserrat',sans-serif", fontWeight: 300 }}>
                      Learn With The Best
                    </span>
                    <br />
                    <span className="inline-block mt-3 px-6 py-2 rounded-[1rem] text-white font-gotham-bold" style={{ backgroundColor: BRAND, fontFamily: "'Gotham Bold','Gotham-Bold','Montserrat',sans-serif", fontWeight: 700 }}>
                      Anytime, Anywhere
                    </span>
                  </h1>

                  <div className="max-w-4xl mx-auto mb-8">
                    <p className="text-lg md:text-[1.25rem] text-gray-700 font-medium leading-relaxed">
                      Live Interactive Classes For Grades 8-10 (Ssc/Cbse/Icse) | 11th-12th
                      <br className="hidden md:block" />
                      Science & Commerce <span className="font-bold" style={{ color: BRAND }}>JEE & NEET Preparation</span>
                    </p>
                  </div>

                  <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-base md:text-lg font-light">
                    Choose your preferred mode of learning. We offer both online
                    interactive classes and offline coaching centres across India.
                  </p>

                  {/* Cards */}
                  <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto px-2">
                    {/* Virtual Classroom Card */}
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(8,112,184,0.07)] overflow-hidden border border-gray-100 flex flex-col group hover:-translate-y-2 transition-all duration-300">
                      <div className="h-64 overflow-hidden relative">
                         <img 
                           src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80" 
                           alt="Virtual Classroom" 
                           className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <div className="p-8 lg:p-10 text-left flex-1 flex flex-col">
                         <h3 className="text-[1.75rem] font-bold tracking-tight text-gray-900 mb-1">Virtual Classroom</h3>
                         <p className="text-sm text-gray-500 mb-8 font-medium">Live Interactive Classes From Expert Trainers</p>
                         
                         <ul className="space-y-4 mb-10 flex-1">
                            {[
                              'Live Interactive Video Classes', 
                              'Learn From Anywhere, Anytime', 
                              '1000 Free UpCoins On Signup!', 
                              'Expert Trainers & Doubt Sessions'
                            ].map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-gray-700 font-medium text-[0.95rem]">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                </span>
                                {item}
                              </li>
                            ))}
                         </ul>
                         
                         <Button 
                           onClick={() => navigate('/auth')}
                           className="w-full text-white rounded-xl py-7 text-lg font-semibold shadow-lg transition-all active:scale-[0.98]"
                           style={{ backgroundColor: BRAND }}
                         >
                           Start Learning Online <span className="ml-2">»</span>
                         </Button>
                      </div>
                    </div>

                    {/* Offline Centres Card */}
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(8,112,184,0.07)] overflow-hidden border border-gray-100 flex flex-col group hover:-translate-y-2 transition-all duration-300">
                      <div className="h-64 overflow-hidden relative">
                         <img 
                           src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80" 
                           alt="Offline Centres" 
                           className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <div className="p-8 lg:p-10 text-left flex-1 flex flex-col">
                         <h3 className="text-[1.75rem] font-bold tracking-tight text-gray-900 mb-1">Offline Centres</h3>
                         <p className="text-sm text-gray-500 mb-8 font-medium">Physical Coaching Centres Across India</p>
                         
                         <ul className="space-y-4 mb-10 flex-1">
                            {[
                              'Physical classroom experience', 
                              'Face-to-face interaction with teachers', 
                              'Modern facilities & labs', 
                              'Multiple locations across India'
                            ].map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-gray-700 font-medium text-[0.95rem]">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                </span>
                                {item}
                              </li>
                            ))}
                         </ul>
                         
                         <Button 
                           onClick={() => setShowOfflineCentres(true)}
                           className="w-full text-white rounded-xl py-7 text-lg font-semibold shadow-lg transition-all active:scale-[0.98]"
                           style={{ backgroundColor: BRAND }}
                         >
                           View Our Centres <span className="ml-2">»</span>
                         </Button>
                      </div>
                    </div>
                  </div>
               </div>
            </section>

            {/* Stats Section — only "Expert Trainers" card is purple per reference */}
            <section className="py-20 bg-white relative z-10">
               <div className="container mx-auto px-4 max-w-7xl">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                     <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] text-center border border-gray-50 flex flex-col items-center justify-center min-h-[180px] hover:shadow-lg transition-shadow">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">15,000+</div>
                        <div className="text-gray-500 font-medium text-lg">Students</div>
                     </div>
                     <div className="p-8 rounded-[2rem] shadow-lg text-center flex flex-col items-center justify-center min-h-[180px] text-white" style={{ backgroundColor: BRAND }}>
                        <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                        <div className="text-white/90 font-medium text-lg">Expert Trainers</div>
                     </div>
                     <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] text-center border border-gray-50 flex flex-col items-center justify-center min-h-[180px] hover:shadow-lg transition-shadow">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">50+</div>
                        <div className="text-gray-500 font-medium text-lg">Subjects</div>
                     </div>
                     <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] text-center border border-gray-50 flex flex-col items-center justify-center min-h-[180px] hover:shadow-lg transition-shadow">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">4.9/5</div>
                        <div className="text-gray-500 font-medium text-lg">Rating</div>
                     </div>
                  </div>
               </div>
            </section>
          </>
        ) : (
          /* Offline Centres Details */
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <Button 
                variant="ghost" 
                className="mb-8 text-gray-600 hover:text-gray-900 pl-0 hover:bg-transparent"
                onClick={() => setShowOfflineCentres(false)}
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Home
              </Button>

              <div className="text-center mb-16">
                <Badge className="mb-4 px-4 py-2 border rounded-full" style={{ backgroundColor: `${BRAND}20`, color: BRAND, borderColor: `${BRAND}40` }}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Our Physical Centres
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                  Upscholar Offline Centres
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Visit our state-of-the-art coaching centres for an immersive learning experience
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {offlineCentres.map((centre, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl border-gray-100 group">
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={centre.image} 
                        alt={centre.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-white/95 text-gray-900 backdrop-blur-sm border-0 shadow-sm">
                        <MapPin className="w-3 h-3 mr-1" style={{ color: BRAND }} />
                        {centre.name.split(' - ')[1]}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold text-gray-900">{centre.name}</CardTitle>
                      <CardDescription className="flex items-start gap-2 text-gray-500">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                        {centre.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center" style={{ color: BRAND }}>
                            <Phone className="w-4 h-4" />
                          </div>
                          {centre.phone}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center" style={{ color: BRAND }}>
                            <Mail className="w-4 h-4" />
                          </div>
                          {centre.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center" style={{ color: BRAND }}>
                            <Clock className="w-4 h-4" />
                          </div>
                          {centre.timings}
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Facilities</p>
                        <div className="flex flex-wrap gap-2">
                          {centre.features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full text-white shadow-md h-12 rounded-xl hover:opacity-90" style={{ backgroundColor: BRAND }}>
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Centre
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer — light grey, exact copy from reference */}
      <footer className="bg-[#eef0f2] pt-20 pb-8 text-gray-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/mainlogo.png" alt="Upscholar" className="h-10 object-contain" />
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed max-w-xs">
                Live interactive classes for Grades 8-12, JEE & NEET, learn anytime, anywhere.
              </p>
            </div>
            <div>
               <h4 className="font-bold mb-6 flex items-center gap-2 text-lg" style={{ color: BRAND }}>
                 <Phone className="w-5 h-5" /> Phone & WhatsApp
               </h4>
               <ul className="space-y-3 text-[15px] text-gray-600">
                  <li className="flex items-center gap-2 hover:opacity-80">+91 750 600 2004</li>
                  <li className="flex items-center gap-2 hover:opacity-80">+91 750 600 4002</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold mb-6 flex items-center gap-2 text-lg" style={{ color: BRAND }}>
                 <Mail className="w-5 h-5" /> Email & Web
               </h4>
               <ul className="space-y-3 text-[15px] text-gray-600">
                  <li>info@upscholar.in</li>
                  <li>www.upscholar.in</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold mb-6 flex items-center gap-2 text-lg" style={{ color: BRAND }}>
                 <MapPin className="w-5 h-5" /> Visit Us
               </h4>
               <p className="text-[15px] text-gray-600 leading-relaxed">
                 Upscholar, 1st Floor, Asha Icon, Survey No. 80, Next To Venkatesh Petrol Pump, Kalyan Shil Road, Dombivli (E.), 421203
               </p>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 font-medium">
              © 2026 Upscholar. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold text-gray-700">Follow Us On</span>
              <div className="flex gap-3">
                 <a href="#" className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity" style={{ backgroundColor: BRAND }}>
                    <Instagram className="w-4 h-4" />
                 </a>
                 <a href="#" className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity" style={{ backgroundColor: BRAND }}>
                    <Facebook className="w-4 h-4" />
                 </a>
                 <a href="#" className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity" style={{ backgroundColor: BRAND }}>
                    <Linkedin className="w-4 h-4" />
                 </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
