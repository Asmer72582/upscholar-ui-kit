import { API_URL } from '@/config/env';

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  realMoneyAmount?: number;
  currency?: string;
  description: string;
  category: string;
  status: string;
  reference?: string;
  paymentMethod?: string;
  relatedLecture?: {
    _id: string;
    title: string;
    price: number;
  } | string | null;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  metadata?: {
    studentId?: string;
    studentName?: string;
    lectureTitle?: string;
    platformFee?: number;
    grossAmount?: number;
    netAmount?: number;
  };
}

export interface WalletBalance {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
}

const WALLET_API_URL = `${API_URL}/wallet`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('upscholer_token');
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token || '',
  };
};

class WalletService {
  async getBalance(): Promise<WalletBalance> {
    try {
      const response = await fetch(`${WALLET_API_URL}/balance`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch wallet balance');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  async getTransactions(page = 1, limit = 20, filters?: {
    type?: string;
    category?: string;
    status?: string;
  }): Promise<{
    transactions: WalletTransaction[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.status) queryParams.append('status', filters.status);

      const response = await fetch(`${WALLET_API_URL}/transactions?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch transactions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async addFunds(amount: number, paymentMethod: string): Promise<{ message: string; transaction: WalletTransaction }> {
    try {
      const response = await fetch(`${WALLET_API_URL}/add-funds`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ amount, paymentMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add funds');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  }

  async processPayment(lectureId: string, amount: number): Promise<{ message: string; transaction: WalletTransaction }> {
    try {
      const response = await fetch(`${WALLET_API_URL}/pay`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ lectureId, amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async getWalletStats(): Promise<{
    monthlySpending: number;
    monthlyTransactions: number;
    spendingByCategory: Record<string, { total: number; count: number }>;
    recentActivity: {
      credits: number;
      debits: number;
      creditCount: number;
      debitCount: number;
    };
  }> {
    try {
      const response = await fetch(`${WALLET_API_URL}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch wallet stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching wallet stats:', error);
      throw error;
    }
  }

  async withdrawFunds(amount: number, withdrawalMethod: string): Promise<{ message: string; transaction: WalletTransaction }> {
    try {
      const response = await fetch(`${WALLET_API_URL}/withdraw`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ amount, withdrawalMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to withdraw funds');
      }

      return await response.json();
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }

  async getTransactionById(transactionId: string): Promise<WalletTransaction> {
    try {
      const response = await fetch(`${WALLET_API_URL}/transactions/${transactionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }
}

const getEarnings = async () => {
  const response = await fetch(`${WALLET_API_URL}/earnings`, {
    headers: {
      'x-auth-token': localStorage.getItem('upscholer_token') || '',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch earnings');
  }

  return response.json();
};

const requestWithdrawal = async (amount: number, bankDetails: {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName?: string;
}, upiId?: string) => {
  const response = await fetch(`${WALLET_API_URL}/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('upscholer_token') || '',
    },
    body: JSON.stringify({ amount, bankDetails, upiId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to process withdrawal');
  }

  return response.json();
};

const walletServiceInstance = new WalletService();

export const walletService = {
  getBalance: walletServiceInstance.getBalance.bind(walletServiceInstance),
  getTransactions: walletServiceInstance.getTransactions.bind(walletServiceInstance),
  getStats: walletServiceInstance.getWalletStats.bind(walletServiceInstance),
  processPayment: walletServiceInstance.processPayment.bind(walletServiceInstance),
  getEarnings,
  requestWithdrawal
};