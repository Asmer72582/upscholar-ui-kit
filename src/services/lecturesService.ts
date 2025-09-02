import { Lecture, Course } from '@/types';

// Mock lectures data
const mockLectures: Lecture[] = [
  {
    id: 'lecture-1',
    title: 'Introduction to React Hooks',
    description: 'Learn the fundamentals of React Hooks and how to use them effectively in your applications.',
    trainer: {
      id: 'trainer-1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'trainer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      createdAt: '2024-01-01T00:00:00Z',
    },
    price: 50,
    duration: 90,
    scheduledAt: '2024-01-15T14:00:00Z',
    maxStudents: 25,
    enrolledStudents: 18,
    status: 'scheduled',
    category: 'Programming',
    tags: ['React', 'JavaScript', 'Frontend'],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  },
  {
    id: 'lecture-2',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript patterns and best practices for enterprise applications.',
    trainer: {
      id: 'trainer-2',
      email: 'mike@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'trainer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      createdAt: '2024-01-01T00:00:00Z',
    },
    price: 75,
    duration: 120,
    scheduledAt: '2024-01-16T16:00:00Z',
    maxStudents: 20,
    enrolledStudents: 15,
    status: 'scheduled',
    category: 'Programming',
    tags: ['TypeScript', 'JavaScript', 'Advanced'],
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
  },
];

class LecturesService {
  async getAllLectures(): Promise<Lecture[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLectures;
  }

  async getLectureById(id: string): Promise<Lecture | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLectures.find(lecture => lecture.id === id) || null;
  }

  async createLecture(lecture: Omit<Lecture, 'id' | 'enrolledStudents'>): Promise<Lecture> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newLecture: Lecture = {
      ...lecture,
      id: `lecture-${Date.now()}`,
      enrolledStudents: 0,
    };
    mockLectures.push(newLecture);
    return newLecture;
  }

  async enrollInLecture(lectureId: string, studentId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const lecture = mockLectures.find(l => l.id === lectureId);
    if (lecture) {
      lecture.enrolledStudents += 1;
    }
  }
}

export const lecturesService = new LecturesService();