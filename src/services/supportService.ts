import { API_URL } from "@/config/env";

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

export interface SupportRequest {
  subject: string;
  message: string;
  category?: string;
}

class SupportService {
  async sendSupportRequest(request: SupportRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/support/send`, {
        ...fetchConfig,
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send support request");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error sending support request:", error);
      throw error;
    }
  }
}

export const supportService = new SupportService();
