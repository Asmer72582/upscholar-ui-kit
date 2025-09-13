import { User } from '@/types';

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('upscholer_token');
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token || '',
  };
};

const fetchConfig = {
  credentials: 'include' as RequestCredentials,
};

export interface TrainerStats {
  earnings: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    recentEarnings: Array<{
      date: string;
      amount: number;
      lecture: string;
      lectureId: string;
    }>;
  };
  lectures: {
    total: number;
    active: number;
    completed: number;
    scheduled: number;
    upcoming: Array<{
      id: string;
      title: string;
      scheduledAt: string;
      duration: number;
      enrolledStudents: number;
      maxStudents: number;
      price: number;
      status: string;
    }>;
  };
  students: {
    total: number;
    active: number;
    newThisWeek: number;
    growth: number;
  };
  performance: {
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    attendanceRate: number;
  };
}

class TrainerService {
  async getDashboardStats(): Promise<TrainerStats> {
    try {
      const response = await fetch(`${API_URL}/trainer/stats/dashboard`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trainer dashboard stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trainer dashboard stats:', error);
      throw error;
    }
  }

  async getUpcomingLectures(): Promise<Array<{
    id: string;
    title: string;
    scheduledAt: string;
    duration: number;
    enrolledStudents: number;
    maxStudents: number;
    price: number;
    status: string;
  }>> {
    try {
      const response = await fetch(`${API_URL}/trainer/lectures/upcoming`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming lectures');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming lectures:', error);
      throw error;
    }
  }

  async getRecentEarnings(): Promise<Array<{
    date: string;
    amount: number;
    lecture: string;
    lectureId: string;
  }>> {
    try {
      const response = await fetch(`${API_URL}/trainer/earnings/recent`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent earnings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent earnings:', error);
      throw error;
    }
  }

  async getStudentAnalytics(): Promise<{
    totalStudents: number;
    activeStudents: number;
    newStudentsThisWeek: number;
    studentGrowth: number;
    topPerformingLectures: Array<{
      id: string;
      title: string;
      enrollments: number;
      rating: number;
      revenue: number;
    }>;
  }> {
    try {
      const response = await fetch(`${API_URL}/trainer/analytics/students`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(): Promise<{
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    attendanceRate: number;
    monthlyProgress: Array<{
      month: string;
      lectures: number;
      earnings: number;
      students: number;
    }>;
  }> {
    try {
      const response = await fetch(`${API_URL}/trainer/analytics/performance`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }
}

export const trainerService = new TrainerService();