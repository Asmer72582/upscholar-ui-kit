import { User, UserRole } from "@/types";
import { API_URL } from "@/config/env";

const AUTH_API_URL = `${API_URL}/auth`;

const fetchConfig = {
  credentials: "include" as RequestCredentials,
  headers: {
    "Content-Type": "application/json",
  },
};

class AuthService {
  async sendOTP(email: string, mobile: string): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    try {
      const response = await fetch(`${AUTH_API_URL}/send-otp`, {
        ...fetchConfig,
        method: "POST",
        body: JSON.stringify({ email, mobile }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send OTP");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to send OTP");
    }
  }

  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${AUTH_API_URL}/verify-otp`, {
        ...fetchConfig,
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to verify OTP");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to verify OTP");
    }
  }

  async login(email: string, password: string, role: UserRole): Promise<User> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        ...fetchConfig,
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({ email, password }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      }

      const data = await response.json();

      // Store the token
      localStorage.setItem("upscholer_token", data.token);

      return {
        id: data.user._id || data.user.id,
        email: data.user.email,
        firstName: data.user.firstname,
        lastName: data.user.lastname,
        name: data.user.name || `${data.user.firstname} ${data.user.lastname}`,
        role: data.user.role as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
        createdAt: data.user.createdAt,
        isApproved: data.user.isApproved,
        status: data.user.status,
        walletBalance: data.user.walletBalance,
        totalEarned: data.user.totalEarned,
        totalSpent: data.user.totalSpent,
        resume: data.user.resume,
        demoVideoUrl: data.user.demoVideoUrl,
        expertise: data.user.expertise,
        experience: data.user.experience,
        bio: data.user.bio,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Login request timed out. Please try again.");
      }
      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    mobile: string,
    role: UserRole,
    otpVerified: boolean,
    trainerData?: {
      resumeFile: File;
      demoVideoUrl: string;
      expertise: string[];
      experience: number;
      bio: string;
    }
  ): Promise<User | { message: string; status: string; email: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      let response;

      if (role === 'trainer' && trainerData) {
        // For trainers, use FormData for file upload
        const formData = new FormData();
        formData.append('email', email);
        formData.append('mobile', mobile);
        formData.append('firstname', firstName);
        formData.append('lastname', lastName);
        formData.append('name', `${firstName} ${lastName}`);
        formData.append('role', role);
        formData.append('otpVerified', otpVerified.toString());
        formData.append('resume', trainerData.resumeFile);
        formData.append('demoVideoUrl', trainerData.demoVideoUrl);
        formData.append('expertise', JSON.stringify(trainerData.expertise));
        formData.append('experience', trainerData.experience.toString());
        formData.append('bio', trainerData.bio);

        response = await fetch(`${AUTH_API_URL}/register`, {
          method: "POST",
          signal: controller.signal,
          credentials: 'include',
          body: formData, // Don't set Content-Type header for FormData
        });
      } else {
        // For students, use JSON
        response = await fetch(`${AUTH_API_URL}/register`, {
          ...fetchConfig,
          method: "POST",
          signal: controller.signal,
          body: JSON.stringify({
            email,
            password,
            mobile,
            firstname: firstName,
            lastname: lastName,
            name: `${firstName} ${lastName}`,
            role,
            otpVerified,
          }),
        });
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register");
      }

      const data = await response.json();

      // For trainers, return the pending status message
      if (role === 'trainer') {
        return {
          message: data.message,
          status: data.status,
          email: data.email
        };
      }

      // For students, store token and return user data
      localStorage.setItem("upscholer_token", data.token);

      return {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstname,
        lastName: data.user.lastname,
        role: data.user.role as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
        createdAt: data.user.createdAt,
        isApproved: data.user.isApproved,
        status: data.user.status,
        resume: data.user.resume,
        demoVideoUrl: data.user.demoVideoUrl,
        expertise: data.user.expertise,
        experience: data.user.experience,
        bio: data.user.bio,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Registration request timed out. Please try again.");
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem("upscholer_token");
    if (!token) throw new Error("No token found");

    const response = await fetch(`${AUTH_API_URL}/me`, {
      ...fetchConfig,
      headers: {
        ...fetchConfig.headers,
        "x-auth-token": token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get user");
    }

    const data = await response.json();

    return {
      id: data._id || data.id,
      email: data.email,
      firstName: data.firstname,
      lastName: data.lastname,
      name: data.name || `${data.firstname} ${data.lastname}`,
      role: data.role as UserRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      createdAt: data.createdAt,
      isApproved: data.isApproved,
      status: data.status,
      walletBalance: data.walletBalance,
      totalEarned: data.totalEarned,
      totalSpent: data.totalSpent,
      resume: data.resume,
      demoVideoUrl: data.demoVideoUrl,
      expertise: data.expertise,
      experience: data.experience,
      bio: data.bio,
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem("upscholer_token");
    localStorage.removeItem("upscholer_user");
  }
}

export const authService = new AuthService();
