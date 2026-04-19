import { getDb } from "./schema";

export type PocStatus =
  | "ヒアリング中"
  | "PoC中"
  | "事例化済み"
  | "提案済み"
  | "受注済み";

export type RelatedApp = "App1" | "App2" | "App3" | "その他";

export interface PocProject {
  id: number;
  title: string;
  company_name: string;
  department: string;
  target_workflow: string;
  related_apps: string;
  start_date: string;
  end_date: string;
  user_count: number;
  status: PocStatus;
  price_estimate: string;
  target_industry: string;
  created_at: string;
  updated_at: string;
}

export interface PocMetrics {
  id: number;
  poc_project_id: number;
  before_check_time_min: number;
  before_inspection_time_min: number;
  before_issue_discovery_min: number;
  before_ng_steps: number;
  before_files_count: number;
  before_transcription_time_min: number;
  before_error_count: number;
  after_dashboard_check_time_min: number;
  after_unperformed_discovery_sec: number;
  after_ng_grasp_sec: number;
  after_transcription_time_min: number;
  after_error_count: number;
  satisfaction_score: number;
  continuation_score: number;
  created_at: string;
  updated_at: string;
}

export interface PocComments {
  id: number;
  poc_project_id: number;
  good_points: string;
  bad_points: string;
  requests: string;
  user_voice: string;
  reason_to_continue: string;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface PocFull {
  project: PocProject;
  metrics: PocMetrics | null;
  comments: PocComments | null;
}

// --- Projects ---

export function listProjects(): PocProject[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM poc_projects ORDER BY updated_at DESC"
    )
    .all() as PocProject[];
}

export function getProject(id: number): PocProject | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM poc_projects WHERE id = ?")
      .get(id) as PocProject) ?? null
  );
}

export function createProject(
  data: Omit<PocProject, "id" | "created_at" | "updated_at">
): PocProject {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO poc_projects
        (title, company_name, department, target_workflow, related_apps,
         start_date, end_date, user_count, status, price_estimate, target_industry)
       VALUES
        (@title, @company_name, @department, @target_workflow, @related_apps,
         @start_date, @end_date, @user_count, @status, @price_estimate, @target_industry)`
    )
    .run(data);
  return getProject(result.lastInsertRowid as number)!;
}

export function updateProject(
  id: number,
  data: Partial<Omit<PocProject, "id" | "created_at" | "updated_at">>
): PocProject | null {
  const db = getDb();
  const fields = Object.keys(data)
    .map((k) => `${k} = @${k}`)
    .join(", ");
  if (!fields) return getProject(id);
  db.prepare(
    `UPDATE poc_projects SET ${fields}, updated_at = datetime('now','localtime') WHERE id = @id`
  ).run({ ...data, id });
  return getProject(id);
}

export function deleteProject(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM poc_projects WHERE id = ?").run(id);
}

// --- Metrics ---

export function getMetrics(pocId: number): PocMetrics | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM poc_metrics WHERE poc_project_id = ?")
      .get(pocId) as PocMetrics) ?? null
  );
}

export function upsertMetrics(
  pocId: number,
  data: Partial<Omit<PocMetrics, "id" | "poc_project_id" | "created_at" | "updated_at">>
): PocMetrics {
  const db = getDb();
  const existing = getMetrics(pocId);
  if (existing) {
    const fields = Object.keys(data)
      .map((k) => `${k} = @${k}`)
      .join(", ");
    if (fields) {
      db.prepare(
        `UPDATE poc_metrics SET ${fields}, updated_at = datetime('now','localtime') WHERE poc_project_id = @pocId`
      ).run({ ...data, pocId });
    }
  } else {
    db.prepare(
      `INSERT INTO poc_metrics (poc_project_id,
        before_check_time_min, before_inspection_time_min, before_issue_discovery_min,
        before_ng_steps, before_files_count, before_transcription_time_min, before_error_count,
        after_dashboard_check_time_min, after_unperformed_discovery_sec, after_ng_grasp_sec,
        after_transcription_time_min, after_error_count, satisfaction_score, continuation_score)
       VALUES
        (@pocId, @before_check_time_min, @before_inspection_time_min, @before_issue_discovery_min,
         @before_ng_steps, @before_files_count, @before_transcription_time_min, @before_error_count,
         @after_dashboard_check_time_min, @after_unperformed_discovery_sec, @after_ng_grasp_sec,
         @after_transcription_time_min, @after_error_count, @satisfaction_score, @continuation_score)`
    ).run({
      pocId,
      before_check_time_min: 0,
      before_inspection_time_min: 0,
      before_issue_discovery_min: 0,
      before_ng_steps: 0,
      before_files_count: 0,
      before_transcription_time_min: 0,
      before_error_count: 0,
      after_dashboard_check_time_min: 0,
      after_unperformed_discovery_sec: 0,
      after_ng_grasp_sec: 0,
      after_transcription_time_min: 0,
      after_error_count: 0,
      satisfaction_score: 0,
      continuation_score: 0,
      ...data,
    });
  }
  return getMetrics(pocId)!;
}

// --- Comments ---

export function getComments(pocId: number): PocComments | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM poc_comments WHERE poc_project_id = ?")
      .get(pocId) as PocComments) ?? null
  );
}

export function upsertComments(
  pocId: number,
  data: Partial<Omit<PocComments, "id" | "poc_project_id" | "created_at" | "updated_at">>
): PocComments {
  const db = getDb();
  const existing = getComments(pocId);
  if (existing) {
    const fields = Object.keys(data)
      .map((k) => `${k} = @${k}`)
      .join(", ");
    if (fields) {
      db.prepare(
        `UPDATE poc_comments SET ${fields}, updated_at = datetime('now','localtime') WHERE poc_project_id = @pocId`
      ).run({ ...data, pocId });
    }
  } else {
    db.prepare(
      `INSERT INTO poc_comments
        (poc_project_id, good_points, bad_points, requests, user_voice, reason_to_continue, next_action)
       VALUES
        (@pocId, @good_points, @bad_points, @requests, @user_voice, @reason_to_continue, @next_action)`
    ).run({
      pocId,
      good_points: "",
      bad_points: "",
      requests: "",
      user_voice: "",
      reason_to_continue: "",
      next_action: "",
      ...data,
    });
  }
  return getComments(pocId)!;
}

// --- Full PoC ---

export function getFullPoc(id: number): PocFull | null {
  const project = getProject(id);
  if (!project) return null;
  return {
    project,
    metrics: getMetrics(id),
    comments: getComments(id),
  };
}

// --- CSV Export ---

export function exportCsv(): string {
  const projects = listProjects();
  const headers = [
    "id", "title", "company_name", "department", "target_workflow",
    "related_apps", "start_date", "end_date", "user_count", "status",
    "price_estimate", "target_industry", "created_at", "updated_at"
  ];
  const rows = projects.map((p) =>
    headers.map((h) => `"${String(p[h as keyof PocProject] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
