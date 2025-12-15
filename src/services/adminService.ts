import { User } from "@/types";
import { API_URL } from "@/config/env";

const AUTH_API_URL = `${API_URL}/auth`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("upscholer_token");
  return {
    "Content-Type": "application/json",
    "x-auth-token": token || "",
  };
};

const fetchConfig = {
  credentials: "include" as RequestCredentials,
};

// Mock admin lecture data
const mockAdminLectures = [
  {
    id: 'lecture-1',
    title: 'Introduction to React Hooks',
    description: 'Learn the fundamentals of React Hooks and how to use them effectively in your applications.',
    trainer: {
      id: 'trainer-1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'trainer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      createdAt: '2024-01-01T00:00:00Z',
    },
    price: 50,
    duration: 90,
    scheduledAt: '2024-01-15T14:00:00Z',
    maxStudents: 25,
    enrolledStudents: 18,
    status: 'approved',
    category: 'Programming',
    tags: ['React', 'JavaScript', 'Frontend'],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lecture-2',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript patterns and best practices for enterprise applications.',
    trainer: {
      id: 'trainer-2',
      email: 'mike@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'trainer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      createdAt: '2024-01-01T00:00:00Z',
    },
    price: 75,
    duration: 120,
    scheduledAt: '2024-01-16T16:00:00Z',
    maxStudents: 20,
    enrolledStudents: 15,
    status: 'pending',
    category: 'Programming',
    tags: ['TypeScript', 'JavaScript', 'Advanced'],
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lecture-3',
    title: 'UI/UX Design Principles',
    description: 'Master the fundamental principles of user interface and user experience design.',
    trainer: {
      id: 'trainer-3',
      email: 'sarah@example.com',
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'trainer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      createdAt: '2024-01-01T00:00:00Z',
    },
    price: 60,
    duration: 105,
    scheduledAt: '2024-01-17T10:00:00Z',
    maxStudents: 30,
    enrolledStudents: 25,
    status: 'rejected',
    category: 'Design',
    tags: ['UI', 'UX', 'Design'],
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lecture-4',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js and Express.',
    trainer: {
      id: 'trainer-4',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Brown',
      role: 'trainer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      createdAt: '2024-01-01T00:00:00Z',
    },
    price: 65,
    duration: 150,
    scheduledAt: '2024-01-18T15:00:00Z',
    maxStudents: 35,
    enrolledStudents: 28,
    status: 'completed',
    category: 'Backend',
    tags: ['Node.js', 'Backend', 'JavaScript'],
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export interface UserStats {
  total: number;
  students: number;
  trainers: number;
  admins: number;
  active: number;
  pending: number;
  suspended: number;
}

export interface PendingTrainer extends User {
  resume: string;
  demoVideoUrl: string;
  expertise: string[];
  experience: number;
  bio: string;
}

class AdminService {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${AUTH_API_URL}/users`, {
        ...fetchConfig,
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch users");
      }

      const users = await response.json();

      // Transform the data to match our User interface
      return users.map((user: any) => ({
        id: user._id,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        role: user.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        createdAt: user.createdAt,
        isApproved: user.isApproved,
        status: user.status,
        resume: user.resume,
        demoVideoUrl: user.demoVideoUrl,
        expertise: user.expertise,
        experience: user.experience,
        bio: user.bio,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async getPendingTrainers(): Promise<PendingTrainer[]> {
    try {
      const response = await fetch(`${AUTH_API_URL}/trainers/pending`, {
        ...fetchConfig,
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch pending trainers");
      }

      const trainers = await response.json();

      return trainers.map((trainer: any) => ({
        id: trainer._id,
        email: trainer.email,
        firstName: trainer.firstname,
        lastName: trainer.lastname,
        role: trainer.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${trainer.email}`,
        createdAt: trainer.createdAt,
        isApproved: trainer.isApproved,
        status: trainer.status,
        resume: trainer.resume,
        demoVideoUrl: trainer.demoVideoUrl,
        expertise: trainer.expertise || [],
        experience: trainer.experience || 0,
        bio: trainer.bio || "",
      }));
    } catch (error) {
      console.error("Error fetching pending trainers:", error);
      throw error;
    }
  }

  async approveTrainer(
    trainerId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${AUTH_API_URL}/trainers/${trainerId}/approve`, {
        ...fetchConfig,
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve trainer");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "Trainer approved successfully",
      };
    } catch (error) {
      console.error("Error approving trainer:", error);
      throw error;
    }
  }

  async rejectTrainer(
    trainerId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${AUTH_API_URL}/trainers/${trainerId}/reject`, {
        ...fetchConfig,
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject trainer");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "Trainer application rejected",
      };
    } catch (error) {
      console.error("Error rejecting trainer:", error);
      throw error;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await fetch(
        `${API_URL}/users/search?name=${encodeURIComponent(query)}`,
        {
          ...fetchConfig,
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to search users");
      }

      const users = await response.json();

      return users.map((user: any) => ({
        id: user._id,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        role: user.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        createdAt: user.createdAt,
        isApproved: user.isApproved,
        status: user.status,
        resume: user.resume,
        demoVideoUrl: user.demoVideoUrl,
        expertise: user.expertise,
        experience: user.experience,
        bio: user.bio,
      }));
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getAllUsers();

      const stats: UserStats = {
        total: users.length,
        students: users.filter((u) => u.role === "student").length,
        trainers: users.filter((u) => u.role === "trainer").length,
        admins: users.filter((u) => u.role === "admin").length,
        active: users.filter((u) => u.status === "approved" || u.isApproved)
          .length,
        pending: users.filter((u) => u.status === "pending").length,
        suspended: users.filter(
          (u) => u.status === "rejected" || u.status === "suspended"
        ).length,
      };

      return stats;
    } catch (error) {
      console.error("Error calculating user stats:", error);
      // Return default stats if there's an error
      return {
        total: 0,
        students: 0,
        trainers: 0,
        admins: 0,
        active: 0,
        pending: 0,
        suspended: 0,
      };
    }
  }

  async downloadUserReport(): Promise<Blob> {
    try {
      const users = await this.getAllUsers();

      // Create CSV content
      const headers = [
        "Name",
        "Email",
        "Role",
        "Status",
        "Join Date",
        "Approved",
      ];
      const csvContent = [
        headers.join(","),
        ...users.map((user) =>
          [
            `"${user.firstName} ${user.lastName}"`,
            user.email,
            user.role,
            user.status,
            new Date(user.createdAt).toLocaleDateString(),
            user.isApproved ? "Yes" : "No",
          ].join(",")
        ),
      ].join("\n");

      return new Blob([csvContent], { type: "text/csv" });
    } catch (error) {
      console.error("Error generating user report:", error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<{
    users: {
      total: number;
      students: number;
      trainers: number;
      pendingTrainers: number;
      growth: number;
      newThisMonth: number;
    };
    lectures: {
      total: number;
      active: number;
      completed: number;
      scheduled: number;
      growth: number;
      newThisMonth: number;
    };
    revenue: {
      total: number;
      thisMonth: number;
      growth: number;
    };
    platformHealth: {
      serverStatus: string;
      databaseStatus: string;
      apiResponseTime: number;
      uptime: string;
    };
  }> {
    try {
      const response = await fetch(
        `${API_URL}/admin/stats/overview`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          ...fetchConfig,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  async getRecentActivity(): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_URL}/admin/stats/recent-activity`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          ...fetchConfig,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recent activity");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  }

  async getPendingApprovals(): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_URL}/admin/stats/pending-approvals`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          ...fetchConfig,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending approvals");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      throw error;
    }
  }

  async suspendUser(
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/suspend`, {
        ...fetchConfig,
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to suspend user");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "User suspended successfully. Email notification sent.",
      };
    } catch (error) {
      console.error("Error suspending user:", error);
      throw error;
    }
  }

  async activateUser(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/activate`, {
        ...fetchConfig,
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to activate user");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "User activated successfully. Email notification sent.",
      };
    } catch (error) {
      console.error("Error activating user:", error);
      throw error;
    }
  }

  async getAllLectures(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/admin/lectures`, {
        method: "GET",
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch lectures");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching lectures:", error);
      throw error;
    }
  }

  async getLectureById(lectureId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/admin/lectures/${lectureId}`, {
        method: "GET",
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch lecture details");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching lecture details:", error);
      throw error;
    }
  }

  async getLectureStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
    scheduled: number;
    live: number;
  }> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Calculate stats from mock data
      const stats = {
        total: mockAdminLectures.length,
        pending: mockAdminLectures.filter(l => l.status === 'pending').length,
        approved: mockAdminLectures.filter(l => l.status === 'approved').length,
        completed: mockAdminLectures.filter(l => l.status === 'completed').length,
        rejected: mockAdminLectures.filter(l => l.status === 'rejected').length,
        scheduled: mockAdminLectures.filter(l => l.status === 'scheduled').length,
        live: mockAdminLectures.filter(l => l.status === 'live').length,
      };
      
      return stats;
    } catch (error) {
      console.error("Error fetching lecture stats:", error);
      throw error;
    }
  }

  async approveLecture(
    lectureId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/admin/lectures/${lectureId}/approve`, {
        method: "PUT",
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve lecture");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "Lecture approved successfully.",
      };
    } catch (error) {
      console.error("Error approving lecture:", error);
      throw error;
    }
  }

  async rejectLecture(
    lectureId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/admin/lectures/${lectureId}/reject`, {
        method: "PUT",
        headers: getAuthHeaders(),
        ...fetchConfig,
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject lecture");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "Lecture rejected successfully.",
      };
    } catch (error) {
      console.error("Error rejecting lecture:", error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
