/**
 * utils.js — 時間計算・異常値判定ユーティリティ
 */

// ================================
// 時間変換
// ================================

/** "HH:MM" → 分（数値） */
function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === '') return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

/** 分（数値） → "H時間M分" 表示 */
function minutesToHHMM(mins) {
  if (mins === null || mins === undefined || isNaN(mins)) return '-';
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  const sign = mins < 0 ? '-' : '';
  return `${sign}${h}:${String(m).padStart(2, '0')}`;
}

/** 分 → "X時間Y分" 日本語表示 */
function minutesToJP(mins) {
  if (mins === null || mins === undefined || isNaN(mins)) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

// ================================
// 集計計算
// ================================

/**
 * 労働時間（分）を計算
 * 労働時間 = (退勤 - 出勤) - 休憩
 */
function calcWorkMinutes(clock_in, clock_out, break_minutes) {
  const inM  = timeToMinutes(clock_in);
  const outM = timeToMinutes(clock_out);
  if (inM === null || outM === null) return null;
  if (outM <= inM) return null; // 不自然な打刻
  const brk = parseInt(break_minutes, 10) || 0;
  const work = outM - inM - brk;
  return work > 0 ? work : null;
}

/**
 * 残業時間（分）を計算
 * 残業時間 = max(0, 労働時間 - 480分[8時間])
 */
function calcOvertimeMinutes(workMinutes) {
  if (workMinutes === null) return null;
  const ot = workMinutes - 480;
  return ot > 0 ? ot : 0;
}

// ================================
// 異常値判定
// ================================

/** 異常種別の定数 */
const ANOMALY = {
  NO_CLOCK_IN:    'clock_in_missing',
  NO_CLOCK_OUT:   'clock_out_missing',
  NO_BREAK:       'no_break',
  LONG_WORK:      'long_work',
  INVALID_CLOCK:  'invalid_clock',
};

const ANOMALY_LABELS = {
  [ANOMALY.NO_CLOCK_IN]:   '出勤未入力',
  [ANOMALY.NO_CLOCK_OUT]:  '退勤未入力',
  [ANOMALY.NO_BREAK]:      '休憩未入力',
  [ANOMALY.LONG_WORK]:     '長時間労働',
  [ANOMALY.INVALID_CLOCK]: '不自然な打刻',
};

/**
 * レコードの異常種別リストを返す
 * @returns {string[]} ANOMALY定数の配列
 */
function detectAnomalies(record) {
  const result = [];
  const { clock_in, clock_out, break_minutes } = record;

  if (!clock_in || clock_in === '')   result.push(ANOMALY.NO_CLOCK_IN);
  if (!clock_out || clock_out === '') result.push(ANOMALY.NO_CLOCK_OUT);

  // 不自然な打刻（clock_outがあるのにclock_in<=clock_out）
  if (clock_in && clock_out && clock_in !== '' && clock_out !== '') {
    const inM  = timeToMinutes(clock_in);
    const outM = timeToMinutes(clock_out);
    if (inM !== null && outM !== null && outM <= inM) {
      result.push(ANOMALY.INVALID_CLOCK);
    }
  }

  // 休憩未入力（出退勤が揃っているのに休憩0 or 未入力）
  const brk = parseInt(break_minutes, 10);
  if (clock_in && clock_out && clock_in !== '' && clock_out !== '' &&
      !result.includes(ANOMALY.INVALID_CLOCK) &&
      (isNaN(brk) || brk === 0)) {
    result.push(ANOMALY.NO_BREAK);
  }

  // 長時間労働（10時間 = 600分超）
  const workM = calcWorkMinutes(clock_in, clock_out, break_minutes);
  if (workM !== null && workM > 600) {
    result.push(ANOMALY.LONG_WORK);
  }

  return result;
}

/**
 * ステータス情報を返す
 * @returns {{ label: string, cssClass: string }}
 */
function getStatus(record) {
  const anomalies = detectAnomalies(record);
  if (anomalies.length === 0) {
    return { label: '正常', cssClass: 'badge-ok' };
  }
  // 優先度: 不自然な打刻 > 出勤未入力 > 退勤未入力 > 長時間労働 > 休憩未入力
  if (anomalies.includes(ANOMALY.INVALID_CLOCK)) {
    return { label: '不自然な打刻', cssClass: 'badge-danger' };
  }
  if (anomalies.includes(ANOMALY.NO_CLOCK_IN)) {
    return { label: '出勤未入力', cssClass: 'badge-danger' };
  }
  if (anomalies.includes(ANOMALY.NO_CLOCK_OUT)) {
    return { label: '退勤未入力', cssClass: 'badge-warning' };
  }
  if (anomalies.includes(ANOMALY.LONG_WORK)) {
    return { label: '長時間労働', cssClass: 'badge-warning' };
  }
  if (anomalies.includes(ANOMALY.NO_BREAK)) {
    return { label: '休憩未入力', cssClass: 'badge-info' };
  }
  return { label: '確認要', cssClass: 'badge-warning' };
}

// ================================
// 月次集計
// ================================

/**
 * 社員別・月単位の集計を返す
 * @param {Object[]} records
 * @param {number} year
 * @param {number} month
 * @returns {Object[]} 集計行配列
 */
function calcMonthlySummary(records, year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthRecords = records.filter(r => r.date.startsWith(prefix));

  const employees = getEmployees();
  return employees.map(emp => {
    const empRecords = monthRecords.filter(r => r.employee_id === emp.id);

    let workDays   = 0;
    let totalWork  = 0;
    let totalOT    = 0;
    let missingCnt = 0;

    empRecords.forEach(r => {
      const anomalies = detectAnomalies(r);
      if (anomalies.includes(ANOMALY.NO_CLOCK_IN) || anomalies.includes(ANOMALY.NO_CLOCK_OUT)) {
        missingCnt++;
      }
      if (r.clock_in && r.clock_in !== '') workDays++;

      const workM = calcWorkMinutes(r.clock_in, r.clock_out, r.break_minutes);
      if (workM !== null) {
        totalWork += workM;
        const otM = calcOvertimeMinutes(workM);
        if (otM !== null) totalOT += otM;
      }
    });

    return {
      employee_id:   emp.id,
      employee_name: emp.name,
      work_days:     workDays,
      total_work:    totalWork,
      total_overtime: totalOT,
      missing_cnt:   missingCnt,
      record_count:  empRecords.length,
    };
  });
}

// ================================
// CSV処理
// ================================

/** CSV文字列 → レコード配列 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return { records: [], errors: ['データが空です'] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const required = ['employee_id', 'employee_name', 'date'];
  const missing = required.filter(r => !headers.includes(r));
  if (missing.length > 0) {
    return { records: [], errors: [`必須列が不足: ${missing.join(', ')}`] };
  }

  const records = [];
  const errors  = [];

  lines.slice(1).forEach((line, i) => {
    if (!line.trim()) return;
    const values = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] || '').trim();
    });

    if (!obj.employee_id || !obj.employee_name || !obj.date) {
      errors.push(`行${i + 2}: employee_id / employee_name / date が不足`);
      return;
    }
    // 日付形式チェック
    if (!/^\d{4}-\d{2}-\d{2}$/.test(obj.date)) {
      errors.push(`行${i + 2}: 日付形式が不正（YYYY-MM-DD）`);
      return;
    }

    records.push({
      employee_id:   obj.employee_id,
      employee_name: obj.employee_name,
      date:          obj.date,
      clock_in:      obj.clock_in      || '',
      clock_out:     obj.clock_out     || '',
      break_minutes: obj.break_minutes ? parseInt(obj.break_minutes, 10) : 0,
      note:          obj.note          || '',
    });
  });

  return { records, errors };
}

/** CSV行をカンマ分割（ダブルクォート対応） */
function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuote = !inQuote; continue; }
    if (c === ',' && !inQuote) { result.push(cur); cur = ''; continue; }
    cur += c;
  }
  result.push(cur);
  return result;
}

/** レコード配列 → CSV文字列 */
function recordsToCSV(records) {
  const headers = ['employee_id', 'employee_name', 'date', 'clock_in', 'clock_out', 'break_minutes', 'note'];
  const rows = [headers.join(',')];
  records.forEach(r => {
    rows.push([
      r.employee_id, r.employee_name, r.date,
      r.clock_in || '', r.clock_out || '',
      r.break_minutes || '', r.note || '',
    ].join(','));
  });
  return rows.join('\n');
}

/** CSVダウンロードをトリガー */
function downloadCSV(csvText, filename) {
  const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ================================
// 日付ユーティリティ
// ================================
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}
