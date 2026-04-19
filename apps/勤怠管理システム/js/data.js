/**
 * data.js — データ管理層
 * LocalStorage をストレージとして使用。
 * ダミーデータを初期ロード。
 */

const STORAGE_KEY = 'attendance_records';
const EMPLOYEES_KEY = 'attendance_employees';

// ================================
// 従業員マスター
// ================================
const DEFAULT_EMPLOYEES = [
  { id: 'EMP001', name: '田中 太郎' },
  { id: 'EMP002', name: '鈴木 花子' },
  { id: 'EMP003', name: '佐藤 次郎' },
  { id: 'EMP004', name: '山田 三郎' },
  { id: 'EMP005', name: '伊藤 美穂' },
  { id: 'EMP006', name: '渡辺 健一' },
];

function getEmployees() {
  const raw = localStorage.getItem(EMPLOYEES_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
  return DEFAULT_EMPLOYEES;
}

// ================================
// レコード CRUD
// ================================
function getRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** 1件保存（同日同社員は上書き） */
function upsertRecord(record) {
  const records = getRecords();
  const idx = records.findIndex(
    r => r.employee_id === record.employee_id && r.date === record.date
  );
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...record };
  } else {
    records.push({ id: generateId(), ...record });
  }
  saveRecords(records);
}

/** IDで1件取得 */
function getRecordById(id) {
  return getRecords().find(r => r.id === id);
}

/** 社員IDと日付で1件取得 */
function getRecordByEmployeeDate(employeeId, date) {
  return getRecords().find(
    r => r.employee_id === employeeId && r.date === date
  ) || null;
}

/** IDで削除 */
function deleteRecord(id) {
  const records = getRecords().filter(r => r.id !== id);
  saveRecords(records);
}

/** 全レコードを置き換え（CSVインポート用） */
function replaceAllRecords(records) {
  saveRecords(records);
}

/** 複数レコードを追記（CSVインポート用・既存を上書き） */
function importRecords(newRecords) {
  let records = getRecords();
  newRecords.forEach(nr => {
    const idx = records.findIndex(
      r => r.employee_id === nr.employee_id && r.date === nr.date
    );
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...nr };
    } else {
      records.push({ id: generateId(), ...nr });
    }
  });
  saveRecords(records);
}

function generateId() {
  return 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

// ================================
// ダミーデータ生成
// ================================
function initDummyData() {
  if (getRecords().length > 0) return; // 既にデータあり

  const employees = DEFAULT_EMPLOYEES;
  const records = [];

  // 2026年2月・3月の平日リスト
  const feb2026 = getWeekdays(2026, 2);
  const mar2026 = getWeekdays(2026, 3).filter(d => d <= '2026-03-17');

  const allDates = [...feb2026, ...mar2026];

  // 社員ごとのベース出勤時刻・退勤時刻（バラエティを持たせる）
  const patterns = [
    { in: '08:00', out: '17:00', variation: true  }, // EMP001
    { in: '08:30', out: '17:30', variation: true  }, // EMP002
    { in: '09:00', out: '18:00', variation: false }, // EMP003
    { in: '08:15', out: '17:15', variation: true  }, // EMP004
    { in: '08:45', out: '17:45', variation: false }, // EMP005
    { in: '07:30', out: '16:30', variation: true  }, // EMP006
  ];

  // 意図的な異常データの定義（デモ用）
  const anomalies = {
    // 退勤未入力
    'EMP003_2026-03-10': { clock_out: '',  break_minutes: 60, note: '' },
    'EMP002_2026-03-14': { clock_out: '',  break_minutes: 60, note: '' },
    // 出勤未入力
    'EMP005_2026-03-05': { clock_in: '',   clock_out: '',  break_minutes: 0, note: '' },
    'EMP004_2026-02-20': { clock_in: '',   clock_out: '',  break_minutes: 0, note: '' },
    // 長時間労働（10時間超）
    'EMP001_2026-03-06': { clock_in: '07:30', clock_out: '21:00', break_minutes: 60, note: '月末対応' },
    'EMP006_2026-03-12': { clock_in: '07:00', clock_out: '20:30', break_minutes: 45, note: '緊急作業' },
    // 休憩未入力
    'EMP002_2026-03-04': { break_minutes: 0, note: '' },
    'EMP003_2026-02-12': { break_minutes: 0, note: '' },
    // 不自然な打刻（退勤<=出勤）
    'EMP004_2026-03-03': { clock_in: '17:30', clock_out: '08:00', break_minutes: 60, note: '打刻ミス' },
    // 追加の退勤未入力
    'EMP001_2026-02-18': { clock_out: '', break_minutes: 60, note: '' },
    'EMP006_2026-02-25': { clock_out: '', break_minutes: 60, note: '' },
  };

  employees.forEach((emp, ei) => {
    const pat = patterns[ei];
    allDates.forEach(date => {
      const key = `${emp.id}_${date}`;
      const anomaly = anomalies[key];

      // ランダム欠勤（約5%）
      if (!anomaly && Math.random() < 0.05) return;

      let clock_in  = addMinuteVariation(pat.in,  pat.variation ? randomInt(-10, 15) : 0);
      let clock_out = addMinuteVariation(pat.out, pat.variation ? randomInt(-5,  30) : 0);
      let break_minutes = 60;

      if (anomaly) {
        if (anomaly.clock_in  !== undefined) clock_in  = anomaly.clock_in;
        if (anomaly.clock_out !== undefined) clock_out = anomaly.clock_out;
        if (anomaly.break_minutes !== undefined) break_minutes = anomaly.break_minutes;
      }

      records.push({
        id: generateId(),
        employee_id:   emp.id,
        employee_name: emp.name,
        date,
        clock_in,
        clock_out,
        break_minutes,
        note: anomaly?.note ?? '',
      });
    });
  });

  saveRecords(records);
}

// ================================
// ユーティリティ
// ================================
function getWeekdays(year, month) {
  const days = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) { // 土日除外
      days.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
  }
  return days;
}

function addMinuteVariation(timeStr, minutes) {
  if (!timeStr) return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm < 0 ? 0 : nm).padStart(2, '0')}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
