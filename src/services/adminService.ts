import { User } from "@/types";

const API_URL = "http://localhost:3000/api/auth";

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
      const response = await fetch(`${API_URL}/users`, {
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
      const response = await fetch(`${API_URL}/trainers/pending`, {
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
      const response = await fetch(`${API_URL}/trainers/${trainerId}/approve`, {
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
      const response = await fetch(`${API_URL}/trainers/${trainerId}/reject`, {
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
        "http://localhost:3000/api/admin/stats/overview",
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
        "http://localhost:3000/api/admin/stats/recent-activity",
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
        "http://localhost:3000/api/admin/stats/pending-approvals",
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
}

export const adminService = new AdminService();
