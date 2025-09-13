export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: 'lecture_enrollment' | 'funds_added' | 'refund' | 'bonus' | 'withdrawal';
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: 'card' | 'paypal' | 'bank_transfer' | 'wallet';
  relatedLecture?: {
    _id: string;
    title: string;
  };
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface WalletBalance {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
}

const API_URL = 'http://localhost:3000/api/wallet';

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
      const response = await fetch(`${API_URL}/balance`, {
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

      const response = await fetch(`${API_URL}/transactions?${queryParams}`, {
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
      const response = await fetch(`${API_URL}/add-funds`, {
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
      const response = await fetch(`${API_URL}/pay`, {
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
      const response = await fetch(`${API_URL}/stats`, {
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
      const response = await fetch(`${API_URL}/withdraw`, {
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
      const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
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

export const walletService = new WalletService();