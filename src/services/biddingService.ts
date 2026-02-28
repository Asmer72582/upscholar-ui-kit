import { API_URL } from '@/config/env';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('upscholer_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'x-auth-token': token }),
  };
};

export type TicketStatus = 'Open' | 'Bidding' | 'Booked' | 'Completed' | 'Cancelled';
export type ProposalStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';

export interface Ticket {
  _id: string;
  ticketId: string;
  student: string | { _id: string; name?: string; email?: string };
  grade: string;
  board: string;
  state?: string;
  subject: string;
  bookName: string;
  publicationName?: string;
  authorName?: string;
  chapterName: string;
  topicName: string;
  description: string;
  status: TicketStatus;
  attachments?: Array<{ url: string; name?: string }>;
  biddingStartedAt?: string;
  selectedProposal?: string | Proposal;
  escrowAmount?: number;
  commissionRate?: number;
  commissionAmount?: number;
  trainerPayout?: number;
  paymentStatus?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  hasRated?: boolean;
  lecture?: string;
}

export interface Proposal {
  _id: string;
  ticket: string | Ticket;
  trainer: string | { _id: string; name?: string; email?: string; averageRating?: number; totalRatings?: number };
  date: string;
  time: string;
  duration: number;
  price: number;
  status: ProposalStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketData {
  grade: string;
  board: string;
  state?: string;
  subject: string;
  bookName: string;
  publicationName?: string;
  authorName?: string;
  chapterName: string;
  topicName: string;
  description: string;
  attachments?: Array<{ url: string; name?: string }>;
}

export interface CreateProposalData {
  date: string;
  time: string;
  duration: number;
  price: number;
  message?: string;
}

const BASE = `${API_URL}/bidding`;

const getAuthHeadersForUpload = (): HeadersInit => {
  const token = localStorage.getItem('upscholer_token');
  return { 'x-auth-token': token || '' };
};

export const biddingService = {
  async uploadDoubtFile(file: File): Promise<{ url: string; name?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/upload-doubt-file`, {
      method: 'POST',
      headers: getAuthHeadersForUpload(),
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload file');
    }
    return res.json();
  },

  async createTicket(data: CreateTicketData): Promise<{ success: boolean; ticket: { id: string; ticketId: string; status: string; createdAt: string } }> {
    const res = await fetch(`${BASE}/tickets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create request');
    }
    return res.json();
  },

  async getTickets(params?: { status?: string; page?: number; limit?: number; search?: string }): Promise<{
    success: boolean;
    tickets: Ticket[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const sp = new URLSearchParams();
    if (params?.status && params.status !== 'all') sp.set('status', params.status);
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.limit != null) sp.set('limit', String(params.limit));
    if (params?.search && params.search.trim()) sp.set('search', params.search.trim());
    const q = sp.toString();
    const res = await fetch(`${BASE}/tickets${q ? `?${q}` : ''}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch requests');
    }
    return res.json();
  },

  async getTicket(id: string): Promise<{ success: boolean; ticket: Ticket }> {
    const res = await fetch(`${BASE}/tickets/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch request');
    }
    return res.json();
  },

  async getProposals(ticketId: string): Promise<{ success: boolean; proposals: Proposal[] }> {
    const res = await fetch(`${BASE}/tickets/${ticketId}/proposals`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch proposals');
    }
    return res.json();
  },

  async createProposal(ticketId: string, data: CreateProposalData): Promise<{ success: boolean; proposal: Proposal & { ticketId: string } }> {
    const res = await fetch(`${BASE}/tickets/${ticketId}/proposals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit proposal');
    }
    return res.json();
  },

  async selectProposal(ticketId: string, proposalId: string): Promise<{ success: boolean; message: string; ticket: Record<string, unknown> }> {
    const res = await fetch(`${BASE}/tickets/${ticketId}/select-proposal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ proposalId }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to select proposal');
    }
    return res.json();
  },

  async completeTicket(ticketId: string): Promise<{ success: boolean; message: string; ticket: Record<string, unknown> }> {
    const res = await fetch(`${BASE}/tickets/${ticketId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to complete session');
    }
    return res.json();
  },

  async rateTicket(ticketId: string, rating: number, review?: string): Promise<{ success: boolean; message: string; rating: { rating: number; review?: string } }> {
    const res = await fetch(`${BASE}/tickets/${ticketId}/rate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, review }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit rating');
    }
    return res.json();
  },

  async cancelTicket(ticketId: string, reason?: string): Promise<{ success: boolean; message: string; ticket: Record<string, unknown> }> {
    const res = await fetch(`${BASE}/tickets/${ticketId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to cancel request');
    }
    return res.json();
  },

  async getMyProposals(params?: { status?: string; page?: number; limit?: number; search?: string }): Promise<{
    success: boolean;
    proposals: Proposal[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const sp = new URLSearchParams();
    if (params?.status && params.status !== 'all') sp.set('status', params.status);
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.limit != null) sp.set('limit', String(params.limit));
    if (params?.search && params.search.trim()) sp.set('search', params.search.trim());
    const q = sp.toString();
    const res = await fetch(`${BASE}/proposals${q ? `?${q}` : ''}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch proposals');
    }
    return res.json();
  },

  async getTrainerProfile(trainerId: string): Promise<{
    success: boolean;
    profile: {
      name: string;
      email: string;
      bio: string;
      experience: number;
      expertise: string[];
      averageRating: number;
      totalRatings: number;
      sessionsCompleted: number;
      whyChooseMe: string[];
    };
    reviews: { rating: number; review: string; createdAt: string; studentName: string }[];
  }> {
    const res = await fetch(`${BASE}/trainers/${trainerId}/profile`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to load trainer profile');
    }
    return res.json();
  },

  async createLectureFromTicket(ticketId: string): Promise<{ success: boolean; message: string; lecture: { id: string; title: string; scheduledAt: string } }> {
    const res = await fetch(`${BASE}/tickets/${ticketId}/create-lecture`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create lecture');
    }
    return res.json();
  },
};
