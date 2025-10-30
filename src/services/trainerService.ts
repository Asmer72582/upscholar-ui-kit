import { User } from '@/types';
import { API_URL } from '@/config/env';

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

  async getEnrolledStudents(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    enrolledCourses: Array<{
      lectureId: string;
      lectureTitle: string;
      status: string;
      scheduledAt: string;
      attended: boolean;
    }>;
    totalLectures: number;
    completedLectures: number;
    attendedLectures: number;
    progress: number;
    status: string;
    enrolledDate: string;
    lastActive: string;
  }>> {
    try {
      const response = await fetch(`${API_URL}/trainer/students`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enrolled students');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      throw error;
    }
  }

  async getCourseStats(): Promise<Array<{
    course: string;
    totalStudents: number;
    activeStudents: number;
    averageProgress: number;
    completionRate: number;
  }>> {
    try {
      const response = await fetch(`${API_URL}/trainer/students/course-stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      throw error;
    }
  }

  async sendEmailToStudent(studentId: string, subject: string, content: string): Promise<{
    success: boolean;
    message: string;
    recipient: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/trainer/students/send-email`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ studentId, subject, content }),
        ...fetchConfig,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async getProfile(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/trainer/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trainer profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trainer profile:', error);
      throw error;
    }
  }

  async updateProfile(data: {
    firstname?: string;
    lastname?: string;
    bio?: string;
    demoVideoUrl?: string;
    expertise?: string[];
  }): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/trainer/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        ...fetchConfig,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/trainer/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
        ...fetchConfig,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export const trainerService = new TrainerService();