import { Wallet, Transaction } from '@/types';

// Mock wallet data
const mockWallets: Record<string, Wallet> = {
  'user-1': {
    id: 'wallet-1',
    userId: 'user-1',
    balance: 250,
    transactions: [
      {
        id: 'txn-1',
        type: 'credit',
        amount: 100,
        description: 'Initial bonus',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'txn-2',
        type: 'credit',
        amount: 200,
        description: 'Purchased Upcoins',
        createdAt: '2024-01-02T00:00:00Z',
      },
      {
        id: 'txn-3',
        type: 'debit',
        amount: 50,
        description: 'Enrolled in React Hooks lecture',
        createdAt: '2024-01-03T00:00:00Z',
        relatedLectureId: 'lecture-1',
      },
    ],
  },
};

class WalletService {
  async getWallet(userId: string): Promise<Wallet> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Create default wallet if doesn't exist
    if (!mockWallets[userId]) {
      mockWallets[userId] = {
        id: `wallet-${userId}`,
        userId,
        balance: 0,
        transactions: [],
      };
    }
    
    return mockWallets[userId];
  }

  async addFunds(userId: string, amount: number): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const wallet = await this.getWallet(userId);
    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      type: 'credit',
      amount,
      description: 'Purchased Upcoins',
      createdAt: new Date().toISOString(),
    };
    
    wallet.balance += amount;
    wallet.transactions.unshift(transaction);
    
    return transaction;
  }

  async deductFunds(userId: string, amount: number, description: string, relatedLectureId?: string): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const wallet = await this.getWallet(userId);
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      type: 'debit',
      amount,
      description,
      createdAt: new Date().toISOString(),
      relatedLectureId,
    };
    
    wallet.balance -= amount;
    wallet.transactions.unshift(transaction);
    
    return transaction;
  }
}

export const walletService = new WalletService();