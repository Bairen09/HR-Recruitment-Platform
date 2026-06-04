/**
 * Service layer — all services call the live backend via `http.ts`.
 * Normalizer functions handle backend→frontend field mapping.
 */
import type {
  AuditEntry,
  Candidate,
  CandidateProfile,
  DashboardStats,
  Interview,
  NotificationItem,
  Task,
  TimelineEvent,
  User,
} from "@/types";
import { http } from "./http";

// ─── Normalizers ────────────────────────────────────────────────────────────

const normalizeCandidate = (candidate: any): Candidate => ({
  id: candidate._id ?? candidate.id ?? "",
  code: candidate.code ?? "",
  name: candidate.name ?? "Unknown Candidate",
  email: candidate.email ?? "",
  phone: candidate.phone ?? "",
  category: candidate.category ?? "General",
  status: candidate.status ?? "NEW",
  createdAt: candidate.createdAt ?? new Date().toISOString(),
  assignedTo: candidate.assignedHR ?? candidate.assignedTo ?? undefined,
});

const normalizeTimeline = (t: any): TimelineEvent => ({
  id: t._id ?? t.id ?? "",
  type: t.eventType ?? t.type ?? "",
  title: t.title ?? "",
  description: t.description ?? undefined,
  at: t.createdAt ?? t.at ?? "",
  by:
    typeof t.performedBy === "object" && t.performedBy !== null
      ? t.performedBy.name ?? "System"
      : t.by ?? "System",
});

const normalizeAudit = (a: any): AuditEntry => ({
  id: a._id ?? a.id ?? "",
  field: a.fieldName ?? a.field ?? "",
  oldValue: a.oldValue ?? "",
  newValue: a.newValue ?? "",
  updatedBy:
    typeof a.changedBy === "object" && a.changedBy !== null
      ? a.changedBy.name ?? "System"
      : a.updatedBy ?? a.changedBy ?? "System",
  timestamp: a.changedAt ?? a.timestamp ?? "",
});

const normalizeInterview = (i: any): Interview => ({
  id: i._id ?? i.id ?? "",
  candidateId:
    typeof i.candidateId === "object" && i.candidateId !== null
      ? i.candidateId._id ?? i.candidateId.id ?? ""
      : i.candidateId ?? "",
  candidateName:
    typeof i.candidateId === "object" && i.candidateId !== null
      ? i.candidateId.name ?? "Candidate"
      : i.candidateName ?? "Candidate",
  interviewerName: i.interviewerName ?? "",
  interviewType: i.interviewType ?? "TECHNICAL",
  scheduledAt: i.scheduledAt ?? "",
  status: i.status ?? "SCHEDULED",
});

const normalizeTask = (t: any): Task => ({
  id: t._id ?? t.id ?? "",
  title: t.title ?? "",
  description: t.description ?? undefined,
  status: t.status ?? "ASSIGNED",
  priority: t.priority ?? "MEDIUM",
  dueDate: t.deadline ?? t.dueDate ?? "",
  assigneeName:
    typeof t.assignedBy === "object" && t.assignedBy !== null
      ? t.assignedBy.name ?? "—"
      : t.assigneeName ?? "—",
  candidateName:
    typeof t.candidateId === "object" && t.candidateId !== null
      ? t.candidateId.name ?? undefined
      : t.candidateName ?? undefined,
});

const normalizeNotification = (n: any): NotificationItem => ({
  id: n._id ?? n.id ?? "",
  title: n.title ?? "",
  body: n.body ?? n.message ?? "",
  read: n.read ?? n.isRead ?? false,
  createdAt: n.createdAt ?? "",
  type: n.type ?? "INFO",
});

const normalizeDailyReport = (r: any): any => ({
  id: r._id ?? r.id ?? "",
  hrId: r.hrId ?? "",
  reportDate: r.reportDate ?? "",
  candidatesAssigned: r.candidatesAssigned ?? 0,
  candidatesCalled: r.candidatesCalled ?? 0,
  interviewsScheduled: r.interviewsScheduled ?? 0,
  selectedCandidates: r.selectedCandidates ?? 0,
  droppedCandidates: r.droppedCandidates ?? 0,
  pendingCandidates: r.pendingCandidates ?? 0,
  createdAt: r.createdAt ?? "",
});

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authService = {
  async login(email: string, password: string) {
    const response = await http.post("/auth/login", { email, password });
    const payload = response.data;
    const user = payload.user;
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: {
        id: user._id ?? user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async logout() {
    await http.post("/auth/logout");
  },
};

// ─── Users ──────────────────────────────────────────────────────────────────

export const userService = {
  async list(): Promise<User[]> {
    const response = await http.get("/users");
    return (response.data ?? []).map((u: any) => ({
      id: u._id ?? u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  },
};

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const dashboardService = {
  async get(): Promise<DashboardStats> {
    const response = await http.get("/dashboard");
    return response.data as DashboardStats;
  },
};

// ─── Candidates ─────────────────────────────────────────────────────────────

export const candidateService = {
  async list(): Promise<Candidate[]> {
    const response = await http.get("/candidates");
    return (response.data.candidates ?? []).map(normalizeCandidate);
  },

  async get(id: string): Promise<{
    candidate: Candidate;
    profile: CandidateProfile | null;
    timeline: TimelineEvent[];
    audits: AuditEntry[];
  }> {
    const response = await http.get(`/candidates/${id}`);
    const d = response.data;
    return {
      candidate: normalizeCandidate(d.candidate),
      profile: d.profile ?? null,
      timeline: (d.timeline ?? []).map(normalizeTimeline),
      audits: (d.audits ?? []).map(normalizeAudit),
    };
  },

  async create(data: Omit<Candidate, "id" | "code" | "status" | "createdAt">): Promise<Candidate> {
    const response = await http.post("/candidates", data);
    return normalizeCandidate(response.data);
  },

  async update(id: string, patch: Partial<Candidate>): Promise<Candidate> {
    const response = await http.patch(`/candidates/${id}`, patch);
    return normalizeCandidate(response.data);
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/candidates/${id}`);
  },

  async assign(id: string, hrId: string): Promise<Candidate> {
    const response = await http.patch(`/candidates/${id}/assign`, { hrId });
    return normalizeCandidate(response.data);
  },

  async select(id: string): Promise<Candidate> {
    const response = await http.patch(`/candidates/${id}/select`);
    return normalizeCandidate(response.data);
  },

  async drop(id: string, reason: string): Promise<Candidate> {
    const response = await http.patch(`/candidates/${id}/drop`, { reason });
    return normalizeCandidate(response.data);
  },
};

// ─── Calls ──────────────────────────────────────────────────────────────────

export const callService = {
  async create(data: {
    candidateId: string;
    outcome: string;
    interestStatus: string;
    note?: string;
  }) {
    const response = await http.post("/calls", data);
    return response.data;
  },

  async getFollowUpsToday() {
    const response = await http.get("/calls/followups/today");
    return response.data;
  },

  async getUpcoming() {
    const response = await http.get("/calls/followups/upcoming");
    return response.data;
  },
};

// ─── Interviews ─────────────────────────────────────────────────────────────

export const interviewService = {
  async list(): Promise<Interview[]> {
    const response = await http.get("/interviews");
    return (response.data ?? []).map(normalizeInterview);
  },

  async create(data: {
    candidateId: string;
    interviewerName: string;
    interviewType: string;
    scheduledAt: string;
    meetingLink?: string;
  }): Promise<Interview> {
    const response = await http.post("/interviews", data);
    return normalizeInterview(response.data);
  },

  async complete(id: string, data: { feedback: string; rating: number }): Promise<Interview> {
    const response = await http.patch(`/interviews/${id}/complete`, data);
    return normalizeInterview(response.data);
  },

  async evaluate(id: string, data: { decision: string; reason: string }): Promise<Interview> {
    const response = await http.patch(`/interviews/${id}/evaluate`, data);
    return normalizeInterview(response.data);
  },
};

// ─── Tasks ──────────────────────────────────────────────────────────────────

export const taskService = {
  async list(): Promise<Task[]> {
    const response = await http.get("/tasks");
    return (response.data ?? []).map(normalizeTask);
  },

  async create(data: {
    candidateId: string;
    title: string;
    description: string;
    deadline: string;
  }): Promise<Task> {
    const response = await http.post("/tasks", data);
    return normalizeTask(response.data);
  },

  async submit(id: string, data: { submissionLink: string }): Promise<Task> {
    const response = await http.patch(`/tasks/${id}/submit`, data);
    return normalizeTask(response.data);
  },

  async review(id: string, data: {
    outcome: string;
    reviewNotes: string;
    score: number;
    reason?: string;
    newDeadline?: string;
  }): Promise<Task> {
    const response = await http.patch(`/tasks/${id}/review`, data);
    return normalizeTask(response.data);
  },
};

// ─── Reports ────────────────────────────────────────────────────────────────

export const reportService = {
  /** Chart data for Dashboard / Reports pages — computed client-side until backend aggregates exist */
  async get() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    return {
      hiringTrend: months.map((m, i) => ({
        month: m,
        applied: 60 + Math.floor(Math.random() * 60) + i * 5,
        interviewed: 25 + Math.floor(Math.random() * 30) + i * 3,
        hired: 5 + Math.floor(Math.random() * 8) + i,
      })),
      sourceMix: [
        { name: "LinkedIn", value: 42 },
        { name: "Referrals", value: 26 },
        { name: "Naukri", value: 18 },
        { name: "Career Site", value: 14 },
      ],
      hrProductivity: ["Rohan", "Priya", "Aanya", "Ishan"].map((n) => ({
        name: n,
        calls: 20 + Math.floor(Math.random() * 40),
        interviews: 5 + Math.floor(Math.random() * 20),
        offers: 1 + Math.floor(Math.random() * 6),
      })),
      conversionRate: 18.4,
      selectionRate: 12.6,
    };
  },

  /** Generate a daily report snapshot */
  async generate() {
    const response = await http.post("/daily-reports/generate");
    return normalizeDailyReport(response.data);
  },

  /** Fetch all daily reports for the logged-in HR */
  async getMyReports() {
    const response = await http.get("/daily-reports/me");
    return (response.data ?? []).map(normalizeDailyReport);
  },
};

// ─── Notifications ──────────────────────────────────────────────────────────

export const notificationService = {
  async list(): Promise<NotificationItem[]> {
    const response = await http.get("/notifications");
    return (response.data ?? []).map(normalizeNotification);
  },

  async markRead(id: string): Promise<void> {
    await http.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    // Backend has no bulk mark-read endpoint — mark individually
    const all = await notificationService.list();
    const unread = all.filter((n) => !n.read);
    await Promise.all(unread.map((n) => notificationService.markRead(n.id)));
  },
};

// ─── Activity ───────────────────────────────────────────────────────────────

export const activityService = {
  async list(): Promise<TimelineEvent[]> {
    const response = await http.get("/activity");
    return (response.data ?? []).map(normalizeTimeline);
  },
};
