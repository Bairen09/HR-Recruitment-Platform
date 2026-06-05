import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Award, Briefcase, CalendarCheck, ClipboardList, GraduationCap, History, Mail, Phone, Sparkles } from "lucide-react";
import { AppShell } from "@/layouts/AppShell";
import { candidateService, interviewService, taskService, userService, callService } from "@/services";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";



export default function CandidateDetailsPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => candidateService.get(id!),
    enabled: !!id,
  });
  const { data: allInterviews = [] } = useQuery({ queryKey: ["interviews"], queryFn: () => interviewService.list() });
  const { data: allTasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => taskService.list() });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => userService.list() });

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [completeInterviewId, setCompleteInterviewId] = useState<string | null>(null);
  const [evaluateInterviewId, setEvaluateInterviewId] = useState<string | null>(null);
  const [submitTaskId, setSubmitTaskId] = useState<string | null>(null);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  
  const [selectedHrId, setSelectedHrId] = useState("");
  const [callData, setCallData] = useState({ outcome: "ANSWERED", interestStatus: "INTERESTED", note: "" });
  const [completeData, setCompleteData] = useState({ feedback: "", rating: 5 });
  const [evaluateData, setEvaluateData] = useState({ decision: "SELECT", reason: "" });
  const [submitData, setSubmitData] = useState({ submissionLink: "" });
  const [reviewData, setReviewData] = useState({ outcome: "SATISFIED", reviewNotes: "", score: 100, reason: "", newDeadline: "" });

  const assignMutation = useMutation({
    mutationFn: (hrId: string) => candidateService.assign(id!, hrId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidate", id] });
      setIsAssignOpen(false);
    },
  });

  const callMutation = useMutation({
    mutationFn: (data: any) => callService.create({ candidateId: id!, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidate", id] });
      setIsCallOpen(false);
      setCallData({ outcome: "ANSWERED", interestStatus: "INTERESTED", note: "" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (data: any) => interviewService.complete(completeInterviewId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interviews"] });
      qc.invalidateQueries({ queryKey: ["candidate", id] });
      setCompleteInterviewId(null);
      setCompleteData({ feedback: "", rating: 5 });
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: (data: any) => interviewService.evaluate(evaluateInterviewId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interviews"] });
      qc.invalidateQueries({ queryKey: ["candidate", id] });
      setEvaluateInterviewId(null);
      setEvaluateData({ decision: "SELECT", reason: "" });
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: (data: any) => taskService.submit(submitTaskId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["candidate", id] });
      setSubmitTaskId(null);
      setSubmitData({ submissionLink: "" });
    },
  });

  const reviewTaskMutation = useMutation({
    mutationFn: (data: any) => taskService.review(reviewTaskId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["candidate", id] });
      setReviewTaskId(null);
      setReviewData({ outcome: "SATISFIED", reviewNotes: "", score: 100, reason: "", newDeadline: "" });
    },
  });

  if (isLoading) return <div className="grid h-60 place-items-center"><div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (error || !data) return <p className="text-sm text-destructive">Could not load candidate.</p>;

  const { candidate, profile, timeline = [], audits = [] } = data;
  const candidateInterviews = allInterviews.filter((i) => i.candidateId === candidate?.id);
  const candidateTasks = allTasks.filter((t) => t.candidateName === candidate?.name);

  const skills = profile?.skills ?? [];
  const experience = profile?.experience ?? [];
  const education = profile?.education ?? [];
  const projects = profile?.projects ?? [];
  const certifications = profile?.certifications ?? [];

  return (
    <>
      <Link to={"/candidates" as any} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to candidates
      </Link>

      {/* Hero */}
      <div className="card-elevated relative overflow-hidden p-6">
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 gradient-primary opacity-90" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-card bg-card text-xl font-semibold text-primary shadow-elevated">
            {(candidate?.name ?? "Unknown Candidate").split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("") || "UC"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{candidate?.name ?? "Unknown Candidate"}</h1>
              <StatusBadge status={candidate?.status} />
            </div>
            <p className="mt-1 text-xs font-mono text-muted-foreground">{candidate?.code ?? "N/A"}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" />{candidate?.email ?? "—"}</span>
              <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" />{candidate?.phone ?? "—"}</span>
              <span className="inline-flex items-center gap-1.5"><Briefcase className="size-3.5" />{candidate?.category ?? "General"}</span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between gap-3 sm:flex-col sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setIsAssignOpen(true)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Assign HR
              </button>
              <button 
                onClick={() => setIsCallOpen(true)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Log Call
              </button>
              <button className="rounded-lg gradient-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-95">
                Schedule interview
              </button>
            </div>
            {candidate?.assignedTo && (
              <p className="text-xs text-muted-foreground mt-2">
                Assigned to: <span className="font-medium text-foreground">{candidate.assignedTo}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="bg-card">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="audits">Audit Logs</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card-elevated p-5">
              <h3 className="text-sm font-semibold text-muted-foreground">Basic info</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Candidate code", candidate?.code ?? "N/A"],
                  ["Full name", candidate?.name ?? "Unknown Candidate"],
                  ["Email", candidate?.email ?? "—"],
                  ["Phone", candidate?.phone ?? "—"],
                  ["Category", candidate?.category ?? "General"],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card-elevated p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Top skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                    <Sparkles className="size-3" /> {s}
                  </span>
                ))}
                {skills.length === 0 && <p className="text-xs text-muted-foreground">No skills specified.</p>}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { k: candidateInterviews.length, v: "Interviews" },
                  { k: candidateTasks.length, v: "Tasks" },
                  { k: experience.length, v: "Roles" },
                  { k: certifications.length, v: "Certs" },
                ].map((x) => (
                  <div key={x.v} className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-2xl font-semibold text-foreground">{x.k}</p>
                    <p className="text-xs text-muted-foreground">{x.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <ProfileSection icon={<GraduationCap className="size-4" />} title="Education">
            <ul className="space-y-3">
              {education.map((e, i) => (
                <li key={i} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{e.degree}</p>
                    <p className="text-xs text-muted-foreground">{e.institute}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{e.year}</span>
                </li>
              ))}
              {education.length === 0 && <p className="text-xs text-muted-foreground p-3">No education details recorded.</p>}
            </ul>
          </ProfileSection>

          <ProfileSection icon={<Briefcase className="size-4" />} title="Experience">
            <ul className="space-y-3">
              {experience.map((e, i) => (
                <li key={i} className="rounded-lg border border-border bg-background/40 p-3 text-sm">
                  <div className="flex justify-between"><p className="font-medium text-foreground">{e.role}</p><span className="text-xs text-muted-foreground">{e.from} → {e.to}</span></div>
                  <p className="text-xs text-muted-foreground">{e.company}</p>
                </li>
              ))}
              {experience.length === 0 && <p className="text-xs text-muted-foreground p-3">No work experience details recorded.</p>}
            </ul>
          </ProfileSection>

          <ProfileSection icon={<ClipboardList className="size-4" />} title="Projects">
            <ul className="space-y-3">
              {projects.map((p, i) => (
                <li key={i} className="rounded-lg border border-border bg-background/40 p-3 text-sm">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </li>
              ))}
              {projects.length === 0 && <p className="text-xs text-muted-foreground p-3">No projects recorded.</p>}
            </ul>
          </ProfileSection>

          <ProfileSection icon={<Award className="size-4" />} title="Certifications">
            <ul className="space-y-3">
              {certifications.map((c, i) => (
                <li key={i} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.issuer}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.year}</span>
                </li>
              ))}
              {certifications.length === 0 && <p className="text-xs text-muted-foreground p-3">No certifications recorded.</p>}
            </ul>
          </ProfileSection>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="card-elevated p-6">
            <ol className="relative space-y-6 border-l-2 border-border pl-6">
              {timeline.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[31px] grid size-5 place-items-center rounded-full border-2 border-card bg-primary shadow-sm" />
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.at ? formatDistanceToNow(new Date(t.at), { addSuffix: true }) : "—"} • {t.by ?? "System"}
                  </p>
                </li>
              ))}
              {timeline.length === 0 && <p className="text-xs text-muted-foreground">No timeline events recorded.</p>}
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="audits" className="mt-4">
          <div className="card-elevated overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  {["Field", "Old value", "New value", "Updated by", "Timestamp"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{a.field}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.oldValue}</td>
                    <td className="px-4 py-3 text-foreground">{a.newValue}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.updatedBy}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.timestamp ? format(new Date(a.timestamp), "MMM d, yyyy p") : "—"}</td>
                  </tr>
                ))}
                {audits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">No audit logs available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="mt-4">
          <div className="card-elevated divide-y divide-border">
            {candidateInterviews.length === 0 && <p className="p-6 text-sm text-muted-foreground">No interviews yet.</p>}
            {candidateInterviews.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><CalendarCheck className="size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{i.interviewType} interview with {i.interviewerName}</p>
                    <p className="text-xs text-muted-foreground">{i.scheduledAt ? format(new Date(i.scheduledAt), "EEEE, MMM d • p") : "—"}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs mr-4">{i.status}</span>
                </div>
                {i.status === "SCHEDULED" && (
                  <button onClick={() => setCompleteInterviewId(i.id)} className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
                    Complete
                  </button>
                )}
                {i.status === "COMPLETED" && (
                  <button onClick={() => setEvaluateInterviewId(i.id)} className="shrink-0 rounded-lg gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow hover:opacity-95">
                    Evaluate
                  </button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="card-elevated divide-y divide-border">
            {candidateTasks.length === 0 && <p className="p-6 text-sm text-muted-foreground">No tasks for this candidate.</p>}
            {candidateTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <History className="size-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">Due {t.dueDate ? format(new Date(t.dueDate), "MMM d") : "—"} • {t.assigneeName}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs mr-4">{t.status}</span>
                </div>
                {t.status === "ASSIGNED" && (
                  <button onClick={() => setSubmitTaskId(t.id)} className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
                    Submit Link
                  </button>
                )}
                {t.status === "SUBMITTED" && (
                  <button onClick={() => setReviewTaskId(t.id)} className="shrink-0 rounded-lg gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow hover:opacity-95">
                    Review Task
                  </button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign HR Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign HR</DialogTitle>
            <DialogDescription>Select an HR representative to assign to this candidate.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedHrId}
              onChange={(e) => setSelectedHrId(e.target.value)}
            >
              <option value="">Select HR...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setIsAssignOpen(false)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              onClick={() => assignMutation.mutate(selectedHrId)}
              disabled={!selectedHrId || assignMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Call Dialog */}
      <Dialog open={isCallOpen} onOpenChange={setIsCallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a Call</DialogTitle>
            <DialogDescription>Record the outcome of your call with {candidate?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Outcome</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={callData.outcome}
                onChange={(e) => setCallData({ ...callData, outcome: e.target.value })}
              >
                <option value="ANSWERED">Answered</option>
                <option value="NOT_PICKED">Not Picked</option>
                <option value="BUSY">Busy</option>
              </select>
            </div>
            
            {callData.outcome === "ANSWERED" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Interest Status</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={callData.interestStatus}
                  onChange={(e) => setCallData({ ...callData, interestStatus: e.target.value })}
                >
                  <option value="INTERESTED">Interested</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="NEEDS_FOLLOW_UP">Needs Follow Up</option>
                </select>
              </div>
            )}
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="Any important details from the call..."
                value={callData.note}
                onChange={(e) => setCallData({ ...callData, note: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setIsCallOpen(false)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              onClick={() => callMutation.mutate(callData)}
              disabled={callMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {callMutation.isPending ? "Logging..." : "Log Call"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Interview Dialog */}
      <Dialog open={!!completeInterviewId} onOpenChange={(open) => !open && setCompleteInterviewId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Interview</DialogTitle>
            <DialogDescription>Record the feedback and rating for this interview.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Rating (1-10)</label>
              <input 
                type="number" min="1" max="10"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={completeData.rating}
                onChange={(e) => setCompleteData({ ...completeData, rating: parseInt(e.target.value) || 5 })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Feedback Notes</label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
                placeholder="Technical skills, communication, culture fit..."
                value={completeData.feedback}
                onChange={(e) => setCompleteData({ ...completeData, feedback: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setCompleteInterviewId(null)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              onClick={() => completeMutation.mutate(completeData)}
              disabled={completeMutation.isPending || !completeData.feedback}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {completeMutation.isPending ? "Completing..." : "Complete Interview"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluate Interview Dialog */}
      <Dialog open={!!evaluateInterviewId} onOpenChange={(open) => !open && setEvaluateInterviewId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluate Interview</DialogTitle>
            <DialogDescription>Make a decision based on the interview outcome.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Decision</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={evaluateData.decision}
                onChange={(e) => setEvaluateData({ ...evaluateData, decision: e.target.value })}
              >
                <option value="SELECT">Select candidate</option>
                <option value="TASK">Assign Task</option>
                <option value="DROP">Drop candidate</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Reason / Justification</label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="Why was this decision made?"
                value={evaluateData.reason}
                onChange={(e) => setEvaluateData({ ...evaluateData, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setEvaluateInterviewId(null)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              onClick={() => evaluateMutation.mutate(evaluateData)}
              disabled={evaluateMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {evaluateMutation.isPending ? "Submitting..." : "Submit Evaluation"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Task Dialog */}
      <Dialog open={!!submitTaskId} onOpenChange={(open) => !open && setSubmitTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task</DialogTitle>
            <DialogDescription>Submit the candidate's completed work link.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Submission Link</label>
              <input 
                type="url"
                placeholder="https://github.com/... or Google Drive link"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={submitData.submissionLink}
                onChange={(e) => setSubmitData({ ...submitData, submissionLink: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setSubmitTaskId(null)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              onClick={() => submitTaskMutation.mutate(submitData)}
              disabled={submitTaskMutation.isPending || !submitData.submissionLink}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitTaskMutation.isPending ? "Submitting..." : "Submit Task"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Task Dialog */}
      <Dialog open={!!reviewTaskId} onOpenChange={(open) => !open && setReviewTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Task</DialogTitle>
            <DialogDescription>Evaluate the candidate's submitted work.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Outcome</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={reviewData.outcome}
                onChange={(e) => setReviewData({ ...reviewData, outcome: e.target.value })}
              >
                <option value="SATISFIED">Satisfied (Pass)</option>
                <option value="NEEDS_IMPROVEMENT">Needs Improvement (Rework)</option>
                <option value="FAILED">Failed (Drop)</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Score (0-100)</label>
              <input 
                type="number" min="0" max="100"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={reviewData.score}
                onChange={(e) => setReviewData({ ...reviewData, score: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Review Notes</label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="Detailed feedback..."
                value={reviewData.reviewNotes}
                onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
              />
            </div>

            {reviewData.outcome !== "SATISFIED" && (
              <div className="grid gap-2 border-t pt-4">
                <label className="text-sm font-medium text-destructive">
                  {reviewData.outcome === "FAILED" ? "Reason for Drop" : "Reason for Rework"}
                </label>
                <input 
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={reviewData.reason}
                  onChange={(e) => setReviewData({ ...reviewData, reason: e.target.value })}
                />
              </div>
            )}
            
            {reviewData.outcome === "NEEDS_IMPROVEMENT" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">New Deadline</label>
                <input 
                  type="datetime-local"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={reviewData.newDeadline}
                  onChange={(e) => setReviewData({ ...reviewData, newDeadline: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <button 
              onClick={() => setReviewTaskId(null)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              onClick={() => reviewTaskMutation.mutate(reviewData)}
              disabled={reviewTaskMutation.isPending || (reviewData.outcome === "NEEDS_IMPROVEMENT" && !reviewData.newDeadline)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {reviewTaskMutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProfileSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}
