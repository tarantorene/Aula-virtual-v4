import { User, Topic, Material, Question, QuizAttempt, UserProgress, CourseReview, Message } from '../types';

export const mockUsers: User[] = [
  // Only Admin user is left in the application
  {
    id: 'admin-1',
    name: 'Administrador General',
    email: 'admin',
    role: 'admin',
    passwordHash: 'admin2026', // clave inicial: el sistema obliga a cambiarla en el primer ingreso
    createdAt: '2026-05-01T08:00:00Z',
    isActive: true,
    area: 'ADMINISTRACION'
  }
];

export const mockTopics: Topic[] = [];

export const mockMaterials: Material[] = [];

export const mockQuestions: Question[] = [];

export const mockQuizAttempts: QuizAttempt[] = [];

export const mockUserProgress: UserProgress[] = [];

export const mockCourseReviews: CourseReview[] = [];

export const mockMessages: Message[] = [];
