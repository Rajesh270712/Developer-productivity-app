// User Types
export type UserRole = 'developer' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  teamId?: string;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  managerId: string;
  members: string[]; // Array of user IDs
}

// Log Types
export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface Task {
  id: string;
  description: string;
  timeSpent: number; // in minutes
  tags: string[];
  completed: boolean;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  tasks: Task[];
  mood: MoodType;
  blockers?: string;
  summary: string;
  isReviewed: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  type: 'reminder' | 'submission' | 'review' | 'feedback';
  createdAt: string;
}

// Dashboard Types
export interface ProductivityData {
  date: string;
  tasksCompleted: number;
  totalTimeSpent: number;
  mood: MoodType;
}