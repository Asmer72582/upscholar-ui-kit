import { User, UserRole } from '@/types';

// Mock authentication service
class AuthService {
  async login(email: string, password: string, role: UserRole): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    return {
      id: 'user-1',
      email,
      firstName: 'John',
      lastName: 'Doe',
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: new Date().toISOString(),
    };
  }

  async register(email: string, password: string, firstName: string, lastName: string, role: UserRole): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: new Date().toISOString(),
    };
  }

  async logout(): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const authService = new AuthService();