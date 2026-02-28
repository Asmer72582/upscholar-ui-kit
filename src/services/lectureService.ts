import { API_URL } from '@/config/env';

export interface Lecture {
  id: string;
  title: string;
  description: string;
  trainer: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    avatar?: string;
    bio?: string;
    expertise?: string[];
    experience?: number;
  };
  category: string;
  tags: string[];
  price: number;
  duration: number; // in minutes
  scheduledAt: string;
  maxStudents: number;
  enrolledStudents: Array<{
    student: {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      avatar?: string;
    };
    enrolledAt: string;
    attended: boolean;
  }>;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled' | 'pending';
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  meetingLink?: string;
  recordingUrl?: string;
  materials: Array<{
    name: string;
    url: string;
    type: 'pdf' | 'video' | 'link' | 'document' | 'other';
  }>;
  feedback: Array<{
    student: {
      id: string;
      firstname: string;
      lastname: string;
      avatar?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  averageRating: number;
  totalEarnings: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  enrolledCount: number;
  isFull: boolean;
  canBeCancelled: boolean;
  spectatorPrice?: number;
  spectatorPriceRaw?: number | null;
  hasPaidSpectator?: boolean;
}

export interface CreateLectureData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  duration: number;
  scheduledAt: string;
  maxStudents: number;
  meetingLink?: string;
  spectatorPrice?: number | null;
}

// API Response Interfaces
interface ApiUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
  experience?: number;
}

interface ApiEnrollment {
  student: ApiUser;
  enrolledAt: string;
  attended: boolean;
}

interface ApiFeedback {
  student: ApiUser;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ApiMaterial {
  name: string;
  url: string;
  type: 'pdf' | 'video' | 'link' | 'document' | 'other';
}

interface ApiLecture {
  _id: string;
  title: string;
  description: string;
  trainer: ApiUser;
  category: string;
  tags: string[];
  price: number;
  duration: number;
  scheduledAt: string;
  maxStudents: number;
  enrolledStudents: ApiEnrollment[];
  status: 'scheduled' | 'live' | 'completed' | 'cancelled' | 'pending';
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: ApiUser;
  meetingLink?: string;
  recordingUrl?: string;
  materials: ApiMaterial[];
  feedback: ApiFeedback[];
  averageRating: number;
  totalEarnings: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  enrolledCount?: number;
  isFull?: boolean;
  canBeCancelled?: boolean;
}

export interface LectureFilters {
  category?: string;
  status?: string;
  trainer?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LectureStats {
  totalLectures: number;
  scheduledLectures: number;
  completedLectures: number;
  cancelledLectures: number;
  totalEnrollments: number;
  totalRevenue: number;
}

const LECTURE_API_URL = `${API_URL}/lectures`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('upscholer_token');
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token || '',
  };
};

const fetchConfig = {
  credentials: 'include' as RequestCredentials,
};

class LectureService {
  async getAllLectures(filters: LectureFilters = {}): Promise<{
    lectures: Lecture[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${LECTURE_API_URL}?${queryParams.toString()}`, {
        ...fetchConfig,
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch lectures');
      }

      const data = await response.json();
      
      return {
        lectures: data.lectures.map(this.transformLecture),
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Error fetching lectures:', error);
      throw error;
    }
  }

  async getLectureById(id: string): Promise<Lecture> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/${id}`, {
        ...fetchConfig,
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch lecture');
      }

      const lecture = await response.json();
      return this.transformLecture(lecture);
    } catch (error) {
      console.error('Error fetching lecture:', error);
      throw error;
    }
  }

  async createLecture(lectureData: CreateLectureData): Promise<Lecture> {
    try {
      const response = await fetch(LECTURE_API_URL, {
        ...fetchConfig,
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(lectureData),
      });

      if (!response.ok) {
        let errorBody: { message?: string } | null = null;
        try {
          errorBody = await response.json();
        } catch (parseError) {
          console.error('Failed to parse createLecture error response:', parseError);
        }

        console.error('Create lecture validation error response:', errorBody);

        const message =
          (errorBody && (errorBody.message || (errorBody as { message?: string; error?: string }).error || JSON.stringify(errorBody))) ||
          'Failed to create lecture';

        throw new Error(message);
      }

      const data = await response.json();
      return this.transformLecture(data.lecture);
    } catch (error) {
      console.error('Error creating lecture:', error);
      throw error;
    }
  }

  async updateLecture(id: string, lectureData: Partial<CreateLectureData>): Promise<Lecture> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/${id}`, {
        ...fetchConfig,
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(lectureData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update lecture');
      }

      const data = await response.json();
      return this.transformLecture(data.lecture);
    } catch (error) {
      console.error('Error updating lecture:', error);
      throw error;
    }
  }

  async deleteLecture(id: string): Promise<void> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/${id}`, {
        ...fetchConfig,
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete lecture');
      }
    } catch (error) {
      console.error('Error deleting lecture:', error);
      throw error;
    }
  }

  async enrollInLecture(id: string): Promise<{ message: string; enrolledCount: number }> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/${id}/enroll`, {
        ...fetchConfig,
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to enroll in lecture');
      }

      return await response.json();
    } catch (error) {
      console.error('Error enrolling in lecture:', error);
      throw error;
    }
  }

  async unenrollFromLecture(id: string): Promise<{ message: string; enrolledCount: number }> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/${id}/enroll`, {
        ...fetchConfig,
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unenroll from lecture');
      }

      return await response.json();
    } catch (error) {
      console.error('Error unenrolling from lecture:', error);
      throw error;
    }
  }

  async getMyLectures(): Promise<Lecture[]> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/my/lectures`, {
        ...fetchConfig,
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch my lectures');
      }

      const lectures = await response.json();
      return lectures.map(this.transformLecture);
    } catch (error) {
      console.error('Error fetching my lectures:', error);
      throw error;
    }
  }

  async getLecturesByTrainer(trainerId: string): Promise<Lecture[]> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/trainer/${trainerId}`, {
        ...fetchConfig,
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch trainer lectures');
      }

      const lectures = await response.json();
      return lectures.map(this.transformLecture);
    } catch (error) {
      console.error('Error fetching trainer lectures:', error);
      throw error;
    }
  }

  async getLectureStats(): Promise<LectureStats> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/stats/overview`, {
        ...fetchConfig,
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch lecture stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching lecture stats:', error);
      throw error;
    }
  }

  async submitReview(id: string, reviewData: { rating: number; comment: string }): Promise<{ message: string; review: { id: string; rating: number; comment: string; student: { id: string; firstname: string; lastname: string }; createdAt: string }; averageRating: number }> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/${id}/review`, {
        ...fetchConfig,
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  async completeLecture(id: string): Promise<{ message: string; lecture: Lecture }> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/${id}/complete`, {
        ...fetchConfig,
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete lecture');
      }

      const data = await response.json();
      return {
        message: data.message,
        lecture: this.transformLecture(data.lecture)
      };
    } catch (error) {
      console.error('Error completing lecture:', error);
      throw error;
    }
  }

  async cancelLecture(id: string, reason: string): Promise<{ message: string; lecture: Lecture }> {
    try {
      const response = await fetch(`${LECTURE_API_URL}/${id}/cancel`, {
        ...fetchConfig,
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel lecture');
      }

      const data = await response.json();
      return {
        message: data.message,
        lecture: this.transformLecture(data.lecture)
      };
    } catch (error) {
      console.error('Error cancelling lecture:', error);
      throw error;
    }
  }

  private transformLecture(lecture: {
    _id: string;
    title: string;
    description: string;
    trainer: {
      _id: string;
      firstname: string;
      lastname: string;
      email: string;
      avatar?: string;
      bio?: string;
      expertise?: string[];
      experience?: number;
    };
    category: string;
    tags?: string[];
    price: number;
    duration: number;
    scheduledAt: string;
    maxStudents: number;
    enrolledStudents?: Array<{
      student: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
        avatar?: string;
      };
      enrolledAt: string;
      attended?: boolean;
    }>;
    status: string;
    rejectionReason?: string;
    rejectedAt?: string;
    rejectedBy?: {
      _id: string;
      firstname: string;
      lastname: string;
      email: string;
    };
    meetingLink?: string;
    recordingUrl?: string;
    materials?: Array<{
      name: string;
      url: string;
      type: 'pdf' | 'video' | 'link' | 'document' | 'other';
    }>;
    feedback?: Array<{
      student: {
        _id: string;
        firstname: string;
        lastname: string;
        avatar?: string;
      };
      rating: number;
      comment: string;
      createdAt: string;
    }>;
    averageRating?: number;
    totalEarnings?: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    enrolledCount?: number;
    isFull?: boolean;
    canBeCancelled?: boolean;
    spectatorPrice?: number;
    spectatorPriceRaw?: number | null;
    hasPaidSpectator?: boolean;
  }): Lecture {
    return {
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      trainer: {
        id: lecture.trainer._id,
        firstname: lecture.trainer.firstname,
        lastname: lecture.trainer.lastname,
        email: lecture.trainer.email,
        avatar: lecture.trainer.avatar,
        bio: lecture.trainer.bio,
        expertise: lecture.trainer.expertise,
        experience: lecture.trainer.experience,
      },
      category: lecture.category,
      tags: lecture.tags || [],
      price: lecture.price,
      duration: lecture.duration,
      scheduledAt: lecture.scheduledAt,
      maxStudents: lecture.maxStudents,
      enrolledStudents: lecture.enrolledStudents?.map((enrollment) => ({
        student: {
          id: enrollment.student._id,
          firstname: enrollment.student.firstname,
          lastname: enrollment.student.lastname,
          name: enrollment.student.name,
          email: enrollment.student.email,
          avatar: enrollment.student.avatar,
        },
        enrolledAt: enrollment.enrolledAt,
        attended: enrollment.attended,
      })) || [],
      status: lecture.status as 'scheduled' | 'live' | 'completed' | 'cancelled' | 'pending',
      rejectionReason: lecture.rejectionReason,
      rejectedAt: lecture.rejectedAt,
      rejectedBy: lecture.rejectedBy ? {
        id: lecture.rejectedBy._id,
        firstname: lecture.rejectedBy.firstname,
        lastname: lecture.rejectedBy.lastname,
        email: lecture.rejectedBy.email,
      } : undefined,
      meetingLink: lecture.meetingLink,
      recordingUrl: lecture.recordingUrl,
      materials: lecture.materials || [],
      feedback: lecture.feedback?.map((fb) => ({
        student: {
          id: fb.student._id,
          firstname: fb.student.firstname,
          lastname: fb.student.lastname,
          avatar: fb.student.avatar,
        },
        rating: fb.rating,
        comment: fb.comment,
        createdAt: fb.createdAt,
      })) || [],
      averageRating: lecture.averageRating || 0,
      totalEarnings: lecture.totalEarnings || 0,
      isPublished: lecture.isPublished,
      createdAt: lecture.createdAt,
      updatedAt: lecture.updatedAt,
      enrolledCount: lecture.enrolledCount || lecture.enrolledStudents?.length || 0,
      isFull: lecture.isFull || false,
      canBeCancelled: lecture.canBeCancelled || false,
      spectatorPrice: lecture.spectatorPrice,
      spectatorPriceRaw: lecture.spectatorPriceRaw,
      hasPaidSpectator: lecture.hasPaidSpectator,
    };
  }

  async payForSpectator(lectureId: string): Promise<{ success: boolean; alreadyPaid?: boolean; amount: number; message: string }> {
    const response = await fetch(`${LECTURE_API_URL}/${lectureId}/spectator-pay`, {
      ...fetchConfig,
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to pay for spectator access');
    }
    return response.json();
  }
}

export const lectureService = new LectureService();