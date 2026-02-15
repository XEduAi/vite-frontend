// User & Authentication Types
export type UserRole = 'ADMIN' | 'STUDENT';

export interface User {
  _id: string;
  username: string;
  full_name: string;
  role: UserRole;
  grade?: number;
  parent_name?: string;
  parent_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

export interface TokenRefreshResponse {
  success: boolean;
  data: {
    access_token: string;
  };
}

// Class Types
export interface ScheduleSlot {
  day: number; // 0-6 (Sunday-Saturday)
  time: string; // HH:MM format
  duration: number; // minutes
}

export type FeeType = 'MONTHLY' | 'PER_SESSION';

export interface Class {
  _id: string;
  name: string;
  subject: string;
  grade: number;
  tuition_fee: number;
  fee_type: FeeType;
  schedule_template: ScheduleSlot[];
  students: string[]; // User IDs
  created_at: string;
  updated_at: string;
}

// Session Types
export type SessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
  student_id: string;
  status: AttendanceStatus;
  note?: string;
}

export interface Session {
  _id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  attendance: AttendanceRecord[];
  created_at: string;
  updated_at: string;
}

// Question Types
export type QuestionType = 'MCQ' | 'ESSAY';

export interface MCQOption {
  text: string;
  is_correct: boolean;
}

export interface Question {
  _id: string;
  content: string;
  type: QuestionType;
  options?: MCQOption[];
  metadata: Record<string, any>;
  media_url?: string;
  created_at: string;
  updated_at: string;
}

// Quiz Types
export interface RandomCriteria {
  metadata: Record<string, any>;
  count: number;
}

export interface QuizConfig {
  duration: number; // minutes
  start_time: string;
  end_time: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  config: QuizConfig;
  fixed_questions?: string[]; // Question IDs
  random_config?: RandomCriteria[];
  assigned_classes: string[];
  created_at: string;
  updated_at: string;
}

export interface QuizAnswer {
  question_id: string;
  answer: string | string[]; // string for essay, array for MCQ
}

export interface QuizAttempt {
  _id: string;
  quiz_id: string;
  student_id: string;
  questions: Question[]; // Snapshot
  answers: QuizAnswer[];
  score?: number;
  submitted_at?: string;
  created_at: string;
}

// Tuition Types
export type TuitionStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

export interface Transaction {
  amount: number;
  method: PaymentMethod;
  date: string;
  note?: string;
}

export interface Tuition {
  _id: string;
  student_id: string;
  class_id: string;
  billing_period: string; // YYYY-MM format
  billing_cycle: FeeType;
  total_amount: number;
  paid_amount: number;
  status: TuitionStatus;
  transactions: Transaction[];
  due_date: string;
  created_at: string;
  updated_at: string;
}

// Media Types
export type MediaCategory = 'QUESTION' | 'PROFILE' | 'DOCUMENT' | 'VIDEO';

export interface Media {
  _id: string;
  filename: string;
  file_key: string;
  file_type: string;
  file_size: number;
  category: MediaCategory;
  uploaded_at: string;
}

export interface UploadInitResponse {
  success: boolean;
  data: {
    upload_url: string;
    media_id: string;
    file_key: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
