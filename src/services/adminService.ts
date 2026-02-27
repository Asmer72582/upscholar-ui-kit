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
        // Active users: approved or active status, excluding suspended
        active: users.filter((u) => 
          (u.status === "approved" || u.status === "active") && 
          u.status !== "suspended" &&
          u.status !== "rejected"
        ).length,
        pending: users.filter((u) => u.status === "pending").length,
        // Suspended users: only those explicitly marked as suspended
        suspended: users.filter((u) => u.status === "suspended").length,
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
        throw new Error(error.message || "Lecture not found");
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
    cancelled: number;
  }> {
    try {
      const lectures = await this.getAllLectures();
      
      const stats = {
        total: lectures.length,
        pending: lectures.filter((l: any) => l.status === 'pending').length,
        approved: lectures.filter((l: any) => l.status === 'approved' || l.status === 'scheduled').length,
        completed: lectures.filter((l: any) => l.status === 'completed').length,
        rejected: lectures.filter((l: any) => l.status === 'cancelled' && l.rejectionReason).length,
        scheduled: lectures.filter((l: any) => l.status === 'scheduled').length,
        live: lectures.filter((l: any) => l.status === 'live').length,
        cancelled: lectures.filter((l: any) => l.status === 'cancelled').length,
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
        body: JSON.stringify({ reason }),
        ...fetchConfig,
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

  async getSignupBonusSettings(): Promise<{ enabled: boolean; amount: number }> {
    try {
      const response = await fetch(`${API_URL}/admin/settings/signup-bonus`, {
        ...fetchConfig,
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch signup bonus settings");
      }

      const result = await response.json();
      return result.settings;
    } catch (error) {
      console.error("Error fetching signup bonus settings:", error);
      throw error;
    }
  }

  async updateSignupBonusSettings(enabled: boolean, amount: number): Promise<{ enabled: boolean; amount: number }> {
    try {
      const response = await fetch(`${API_URL}/admin/settings/signup-bonus`, {
        ...fetchConfig,
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled, amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update signup bonus settings");
      }

      const result = await response.json();
      return result.settings;
    } catch (error) {
      console.error("Error updating signup bonus settings:", error);
      throw error;
    }
  }

  async sendNotificationToAll(subject: string, message: string, targetRole?: 'student' | 'trainer' | 'admin'): Promise<{ totalUsers: number; successful: number; failed: number }> {
    try {
      const response = await fetch(`${API_URL}/admin/notifications/send-all`, {
        ...fetchConfig,
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ subject, message, targetRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send notifications");
      }

      const result = await response.json();
      return {
        totalUsers: result.totalUsers,
        successful: result.successful,
        failed: result.failed
      };
    } catch (error) {
      console.error("Error sending notifications:", error);
      throw error;
    }
  }

  async getCancelledRequests(refundStatus?: 'pending' | 'approved' | 'rejected'): Promise<{ requests: CancelledRequest[] }> {
    const url = refundStatus
      ? `${API_URL}/admin/cancelled-requests?refundStatus=${refundStatus}`
      : `${API_URL}/admin/cancelled-requests`;
    const response = await fetch(url, { method: "GET", headers: getAuthHeaders(), ...fetchConfig });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch cancelled requests");
    }
    return response.json();
  }

  async approveCancelledRequestRefund(ticketId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/admin/cancelled-requests/${ticketId}/approve`, {
      method: "PUT",
      headers: getAuthHeaders(),
      ...fetchConfig,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to approve refund");
    }
    return response.json();
  }

  async rejectCancelledRequestRefund(ticketId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/admin/cancelled-requests/${ticketId}/reject`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason: reason || "" }),
      ...fetchConfig,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reject refund");
    }
    return response.json();
  }
}

export interface CancelledRequest {
  id: string;
  ticketId: string;
  subject: string;
  grade: string;
  board: string;
  cancelReason: string;
  cancelledAt: string;
  refundStatus: 'pending' | 'approved' | 'rejected';
  escrowAmount: number;
  paymentStatus: string;
  student: { id: string; name: string; email: string } | null;
  trainerId?: string;
}

export const adminService = new AdminService();
