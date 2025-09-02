# 🎓 Upscholer - Interactive E-Learning Platform

A modern, responsive e-learning platform built with React.js, featuring live interactive sessions, Upcoin rewards system, and role-based dashboards for students, trainers, and administrators.

## ✨ Features

### 🎯 Core Features
- **Live Interactive Sessions** - Real-time lectures with expert trainers
- **Upcoin Rewards System** - Native cryptocurrency for seamless transactions
- **Role-Based Access** - Dedicated experiences for Students, Trainers, and Admins
- **Responsive Design** - Optimized for all device sizes
- **Modern UI/UX** - Clean, accessible interface with smooth animations

### 👨‍🎓 Student Features
- Browse and enroll in lectures
- Wallet management with Upcoins
- Personal learning dashboard
- Support system

### 👨‍🏫 Trainer Features
- Schedule and manage lectures
- Create structured courses
- Student management
- Earnings tracking

### 🛡️ Admin Features
- User management (students & trainers)
- Content moderation
- Platform analytics
- Support ticket management

## 🚀 Tech Stack

- **Frontend**: React.js + TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **UI Components**: Shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Context + React Query
- **Build Tool**: Vite
- **Icons**: Lucide React

## 🎨 Design System

The platform uses a comprehensive blue-focused design system:

- **Primary Colors**: Deep learning blue (#1e3a8a) with gradients
- **Accent Colors**: Bright blue (#3b82f6) for highlights
- **Typography**: Clean, readable sans-serif fonts
- **Components**: Rounded corners (2xl), soft shadows, hover effects
- **Animations**: Smooth transitions, micro-interactions, skeleton loaders

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   ├── layout/         # Layout components (header, sidebar, etc.)
│   └── common/         # Common components (role guard, etc.)
├── pages/              # Page components organized by role
│   ├── student/        # Student-specific pages
│   ├── trainer/        # Trainer-specific pages
│   └── admin/          # Admin-specific pages
├── contexts/           # React contexts for global state
├── services/           # API service layer with mock data
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## 🔧 Setup & Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd upscholer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔑 Environment Setup

The project uses mock data and doesn't require external APIs for development. All services are stubbed with realistic mock responses.

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📱 Mobile Responsiveness

The platform is fully responsive with breakpoints:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## 🔐 Authentication & Authorization

- Role-based authentication (Student/Trainer/Admin)
- Protected routes with role guards
- Persistent sessions with localStorage
- Mock authentication service

## 💡 Integration Placeholders

### Live Streaming
```typescript
// Ready for integration with:
// - Jitsi Meet
// - Twilio Video
// - WebRTC
// - Agora.io
```

### Payment Processing
```typescript
// Ready for integration with:
// - Stripe
// - PayU
// - Razorpay
// - Custom blockchain wallet
```

### Real-time Features
```typescript
// Ready for integration with:
// - Socket.io
// - Firebase Realtime Database
// - Supabase Realtime
// - WebSocket APIs
```

## 🚀 Deployment

The project is optimized for deployment on:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any static hosting service

## 📚 API Documentation

### Mock Services
All services return promises to simulate real API calls:

```typescript
// Authentication
authService.login(email, password, role)
authService.register(userData)

// Lectures
lecturesService.getAllLectures()
lecturesService.createLecture(lectureData)

// Wallet
walletService.getWallet(userId)
walletService.addFunds(userId, amount)
```

## 🎯 Future Enhancements

- [ ] Real-time chat system
- [ ] Video streaming integration
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Gamification features
- [ ] Certificate generation
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ by the Upscholer Team
