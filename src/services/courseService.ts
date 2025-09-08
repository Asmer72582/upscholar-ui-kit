import { mockLectureDetail } from '@/pages/student/CourseDetail';

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  trainer: string;
  trainerAvatar: string;
  trainerBio: string;
  price: number;
  duration: number;
  scheduledAt: string;
  category: string;
  level: string;
  rating: number;
  enrolledStudents: number;
  maxStudents: number;
  tags: string[];
  thumbnail: string;
  learningOutcomes: string[];
  prerequisites: string[];
  syllabus: Array<{
    title: string;
    duration: number;
    topics: string[];
  }>;
  reviews: Array<{
    id: number;
    user: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export const courseService = {
  getCourseById: async (id: string): Promise<Course> => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLectureDetail as Course);
      }, 500);
    });
  }
};