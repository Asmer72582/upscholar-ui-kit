import { API_URL } from '@/config/env';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('upscholer_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'x-auth-token': token }),
  };
};

const getAuthHeadersForUpload = (): HeadersInit => {
  const token = localStorage.getItem('upscholer_token');
  return { 'x-auth-token': token || '' };
};

const BASE = `${API_URL}/practice-series`;

export const practiceSeriesService = {
  // OTP (auth required – uses logged-in user's email)
  async sendOtp(contactNumber?: string) {
    const res = await fetch(`${BASE}/auth/send-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contactNumber }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  },
  async verifyEmailOtp(contactNumber: string, otp: string) {
    const res = await fetch(`${BASE}/auth/verify-email-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contactNumber, otp }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Invalid OTP');
    return data;
  },
  async verifyPhoneOtp(contactNumber: string, otp: string) {
    const res = await fetch(`${BASE}/auth/verify-phone-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contactNumber, otp }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Invalid OTP');
    return data;
  },
  async resendEmailOtp(contactNumber?: string) {
    const res = await fetch(`${BASE}/auth/resend-email-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contactNumber }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to resend');
    return data;
  },
  async resendPhoneOtp(contactNumber?: string) {
    const res = await fetch(`${BASE}/auth/resend-phone-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contactNumber }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to resend');
    return data;
  },

  // Enroll (auth required – attaches Practice Series to logged-in user; sends FormData with marksheet file)
  async enroll(formData: FormData) {
    const res = await fetch(`${BASE}/enroll`, {
      method: 'POST',
      headers: getAuthHeadersForUpload(),
      body: formData,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Enrollment failed');
    return data;
  },

  // Sheets (with optional filters, sort, pagination)
  async getSheets(params?: {
    subject?: string;
    category?: string;
    search?: string;
    sort?: 'newest' | 'oldest' | 'subject' | 'subject-desc';
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.subject) searchParams.set('subject', params.subject);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page != null) searchParams.set('page', String(params.page));
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    const url = `${BASE}/sheets${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to fetch sheets');
    return data;
  },

  async getProfile(): Promise<{
    profile: {
      fullName: string;
      dateOfBirth: string;
      gender: string;
      residentialAddress: string;
      city: string;
      pincode: string;
      contactNumber: string;
      emailId: string;
      classGrade: string;
      educationBoard: string;
      streamOpted: string;
      courseExamPrep: string;
      schoolCollegeName: string;
      emailOtpVerified: boolean;
      phoneOtpVerified: boolean;
      lastExamPercentage?: number;
      marksheetStatus?: string;
    };
  }> {
    const res = await fetch(`${BASE}/profile`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  async getSheetFilterOptions(): Promise<{ subjects: string[]; categories: string[] }> {
    const res = await fetch(`${BASE}/sheets/filter-options`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to fetch filter options');
    return { subjects: data.subjects || [], categories: data.categories || [] };
  },

  /** Download sheet PDF via proxy so it is served as application/pdf with correct filename. */
  async downloadSheetPdf(sheetId: string, filenameBase: string) {
    const res = await fetch(`${BASE}/sheets/${sheetId}/pdf`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to download PDF');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(filenameBase || 'sheet').replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_').slice(0, 100) || 'sheet'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Download answer key PDF via proxy as application/pdf. */
  async downloadSheetAnswersPdf(sheetId: string, filenameBase: string) {
    const res = await fetch(`${BASE}/sheets/${sheetId}/answers-pdf`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to download PDF');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(filenameBase || 'answers').replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_').slice(0, 100) || 'answers'}-answers.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Marksheet
  async uploadMarksheet(file: File) {
    const formData = new FormData();
    formData.append('marksheet', file);
    const res = await fetch(`${BASE}/marksheet`, {
      method: 'POST',
      headers: getAuthHeadersForUpload(),
      body: formData,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
  async removeMarksheet() {
    const res = await fetch(`${BASE}/marksheet`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to remove marksheet');
    return data;
  },

  // Payment
  async createOrder(subject: string) {
    const res = await fetch(`${BASE}/payment/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subject }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to create order');
    return data;
  },
  async verifyPayment(payment: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    subject: string;
  }) {
    const res = await fetch(`${BASE}/payment/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payment),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Payment verification failed');
    return data;
  },

  // Admin
  async adminUploadSheet(formData: FormData) {
    const res = await fetch(`${BASE}/admin/sheets`, {
      method: 'POST',
      headers: getAuthHeadersForUpload(),
      body: formData,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
  async adminUploadAnswer(sheetId: string, file: File) {
    const formData = new FormData();
    formData.append('answerPdf', file);
    const res = await fetch(`${BASE}/admin/sheets/${sheetId}/answers`, {
      method: 'POST',
      headers: getAuthHeadersForUpload(),
      body: formData,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
  async adminDisplayAnswers(sheetId: string) {
    const res = await fetch(`${BASE}/admin/sheets/${sheetId}/answers/display`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to display answers');
    return data;
  },
  async adminGetSheets() {
    const res = await fetch(`${BASE}/admin/sheets`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to fetch');
    return data;
  },
  async adminDeleteSheet(sheetId: string) {
    const res = await fetch(`${BASE}/admin/sheets/${sheetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to delete sheet');
    return data;
  },
  async adminGetMarksheets() {
    const res = await fetch(`${BASE}/admin/marksheets`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to fetch');
    return data;
  },
  async adminApproveMarksheet(id: string, lastExamPercentage?: number, reason?: string) {
    const res = await fetch(`${BASE}/admin/marksheets/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lastExamPercentage, reason }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },
  async adminRejectMarksheet(id: string, reason?: string) {
    const res = await fetch(`${BASE}/admin/marksheets/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },
  async adminNotifyMarksheet(id: string) {
    const res = await fetch(`${BASE}/admin/marksheets/${id}/notify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },
  async adminDeleteMarksheet(id: string) {
    const res = await fetch(`${BASE}/admin/marksheets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to delete');
    return data;
  },
};
