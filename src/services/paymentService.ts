import { API_URL } from '@/config/env';

const getAuthHeaders = () => {
  const token = localStorage.getItem('upscholer_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'x-auth-token': token }),
  };
};

const fetchConfig = {
  credentials: 'include' as RequestCredentials,
};

export interface UpCoinPackage {
  id: string;
  upcoins: number;
  price: number;
  discount: number;
  popular: boolean;
  description: string;
}

export interface PaymentOrder {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  packageId: string;
  upcoins: number;
}

export interface PaymentHistory {
  _id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  packageId: string;
  upcoins: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
}

class PaymentService {
  async getPackages(): Promise<{ success: boolean; packages: UpCoinPackage[] }> {
    try {
      const response = await fetch(`${API_URL}/payment/packages`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  async createOrder(packageId: string): Promise<{ 
    success: boolean; 
    order: PaymentOrder; 
    key: string 
  }> {
    try {
      const response = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ packageId }),
        ...fetchConfig,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }): Promise<{
    success: boolean;
    message: string;
    payment: any;
    wallet: { balance: number; totalEarned: number };
  }> {
    try {
      const response = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
        ...fetchConfig,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async getPaymentHistory(params?: {
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    success: boolean;
    payments: PaymentHistory[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await fetch(
        `${API_URL}/payment/history?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          ...fetchConfig,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  async getPaymentStats(): Promise<{
    success: boolean;
    stats: {
      total: number;
      successful: number;
      failed: number;
      pending: number;
      totalSpent: number;
      totalUpcoinsPurchased: number;
    };
  }> {
    try {
      const response = await fetch(`${API_URL}/payment/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        ...fetchConfig,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
