import { User, UserRole } from '@/types';

const API_URL = 'http://localhost:3000/api/auth';

const fetchConfig = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  }
};

class AuthService {
  async login(email: string, password: string, role: UserRole): Promise<User> {
    const response = await fetch(`${API_URL}/login`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    const data = await response.json();
    
    // Store the token
    localStorage.setItem('upscholer_token', data.token);
    
    return {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstname,
      lastName: data.user.lastname,
      role: data.user.role as UserRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
      createdAt: data.user.createdAt,
    };
  }

  async register(email: string, password: string, firstName: string, lastName: string, role: UserRole): Promise<User> {
    const response = await fetch(`${API_URL}/register`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        firstname: firstName,
        lastname: lastName,
        name: `${firstName} ${lastName}`,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register');
    }

    const data = await response.json();
    
    // Store the token
    localStorage.setItem('upscholer_token', data.token);
    
    return {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstname,
      lastName: data.user.lastname,
      role: data.user.role as UserRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
      createdAt: data.user.createdAt,
    };
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('upscholer_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/me`, {
      ...fetchConfig,
      headers: {
        ...fetchConfig.headers,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user');
    }

    const data = await response.json();
    
    return {
      id: data.id,
      email: data.email,
      firstName: data.firstname,
      lastName: data.lastname,
      role: data.role as UserRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      createdAt: data.createdAt,
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('upscholer_token');
    localStorage.removeItem('upscholer_user');
  }
}

export const authService = new AuthService();