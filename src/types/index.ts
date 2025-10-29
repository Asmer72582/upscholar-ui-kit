// Core Types for Upscholer Platform
export type UserRole = 'student' | 'trainer' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  // Wallet fields
  walletBalance?: number;
  totalEarned?: number;
  totalSpent?: number;
  // Trainer-specific fields
  resume?: string;
  demoVideoUrl?: string;
  expertise?: string[];
  experience?: number;
  bio?: string;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  trainer: User;
  price: number;
  duration: number; // in minutes
  scheduledAt: string;
  maxStudents: number;
  enrolledStudents: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  category: string;
  thumbnail?: string;
  tags: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  trainer: User;
  totalPrice: number;
  lectures: Lecture[];
  enrolledStudents: number;
  rating: number;
  status: 'draft' | 'published' | 'archived';
  category: string;
  thumbnail?: string;
  estimatedDuration: number; // total duration in hours
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // Upcoins
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
  relatedLectureId?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  lectureId?: string;
  courseId?: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Analytics {
  totalStudents: number;
  totalTrainers: number;
  totalLectures: number;
  totalRevenue: number;
  monthlyGrowth: number;
  popularCategories: { name: string; count: number }[];
}