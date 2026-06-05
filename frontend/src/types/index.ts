export type Role = "ADMIN" | "HR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export type CandidateStatus =
  | "NEW"
  | "AI_PROCESSING"
  | "AI_PROCESSED"
  | "FIRST_CALL_PENDING"
  | "FIRST_CALL_DONE"
  | "SECOND_CALL_PENDING"
  | "SECOND_CALL_DONE"
  | "THIRD_CALL_PENDING"
  | "THIRD_CALL_DONE"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "TASK_ASSIGNED"
  | "TASK_REVIEW"
  | "SELECTED"
  | "DROPPED";

export interface Candidate {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  status: CandidateStatus;
  createdAt: string;
  assignedTo?: string;
}

export interface CandidateProfile {
  education: { degree: string; institute: string; year: string }[];
  skills: string[];
  experience: { company: string; role: string; from: string; to: string }[];
  projects: { name: string; description: string }[];
  certifications: { name: string; issuer: string; year: string }[];
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  at: string;
  by?: string;
}

export interface AuditEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  timestamp: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  interviewerName: string;
  interviewType: "HR" | "TECHNICAL" | "MANAGERIAL" | "FINAL";
  scheduledAt: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

export type TaskStatus = "ASSIGNED" | "SUBMITTED" | "REVIEWED" | "PASSED" | "FAILED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  candidateName?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeName: string;
}

export interface DailyReport {
  id: string;
  hrId: string;
  reportDate: string;
  candidatesAssigned: number;
  candidatesCalled: number;
  interviewsScheduled: number;
  selectedCandidates: number;
  droppedCandidates: number;
  pendingCandidates: number;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
}

export interface DashboardStats {
  totalCandidates: number;
  firstCallPending: number;
  secondCallPending: number;
  thirdCallPending: number;
  followUpsToday: number;
  interviewsToday: number;
  tasksToReview: number;
  selectedCandidates: number;
  droppedCandidates: number;
}
// Add to existing types file:

export interface ResumeAnalysisResult {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: number;
  education: string;
  currentCompany: string;
  designation: string;
  location: string;
  summary: string;
  resumeScore: number; // 0-100
}

export interface CandidateFromResume extends Omit<Candidate, "id" | "code" | "createdAt"> {
  resumeFilePath: string;
  aiAnalysis: ResumeAnalysisResult;
}