import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "poc.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS poc_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company_name TEXT NOT NULL DEFAULT '',
      department TEXT NOT NULL DEFAULT '',
      target_workflow TEXT NOT NULL DEFAULT '',
      related_apps TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL DEFAULT '',
      end_date TEXT NOT NULL DEFAULT '',
      user_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ヒアリング中',
      price_estimate TEXT NOT NULL DEFAULT '',
      target_industry TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS poc_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poc_project_id INTEGER NOT NULL REFERENCES poc_projects(id) ON DELETE CASCADE,
      before_check_time_min REAL DEFAULT 0,
      before_inspection_time_min REAL DEFAULT 0,
      before_issue_discovery_min REAL DEFAULT 0,
      before_ng_steps INTEGER DEFAULT 0,
      before_files_count INTEGER DEFAULT 0,
      before_transcription_time_min REAL DEFAULT 0,
      before_error_count INTEGER DEFAULT 0,
      after_dashboard_check_time_min REAL DEFAULT 0,
      after_unperformed_discovery_sec REAL DEFAULT 0,
      after_ng_grasp_sec REAL DEFAULT 0,
      after_transcription_time_min REAL DEFAULT 0,
      after_error_count INTEGER DEFAULT 0,
      satisfaction_score INTEGER DEFAULT 0,
      continuation_score INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS poc_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poc_project_id INTEGER NOT NULL REFERENCES poc_projects(id) ON DELETE CASCADE,
      good_points TEXT NOT NULL DEFAULT '',
      bad_points TEXT NOT NULL DEFAULT '',
      requests TEXT NOT NULL DEFAULT '',
      user_voice TEXT NOT NULL DEFAULT '',
      reason_to_continue TEXT NOT NULL DEFAULT '',
      next_action TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
}
