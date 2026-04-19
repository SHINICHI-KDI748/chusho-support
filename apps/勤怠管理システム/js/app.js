/**
 * app.js — メインアプリケーション
 * ルーティング・各画面のレンダリング・イベントハンドリング
 */

// ================================
// 初期化
// ================================
document.addEventListener('DOMContentLoaded', () => {
  initDummyData();         // ダミーデータ投入
  updateAnomalyBadge();    // サイドバー異常件数バッジ
  navigate('input');       // 初期画面

  // サイドバーナビゲーション
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.view));
  });
});

let currentView = '';

function navigate(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  const content = document.getElementById('content');
  switch (view) {
    case 'input':   content.innerHTML = renderInputView();   bindInputEvents();   break;
    case 'daily':   content.innerHTML = renderDailyView();   bindDailyEvents();   break;
    case 'monthly': content.innerHTML = renderMonthlyView(); bindMonthlyEvents(); break;
    case 'anomaly': content.innerHTML = renderAnomalyView(); bindAnomalyEvents(); break;
    case 'csv':     content.innerHTML = renderCSVView();     bindCSVEvents();     break;
  }
  updateAnomalyBadge();
}

// ================================
// 1. 勤怠入力画面
// ================================
function renderInputView() {
  const employees = getEmployees();
  const today     = todayStr();

  const empOptions = employees
    .map(e => `<option value="${e.id}" data-name="${e.name}">${e.name}</option>`)
    .join('');

  const recentRecords = getRecords()
    .sort((a, b) => b.date.localeCompare(a.date) || a.employee_name.localeCompare(b.employee_name))
    .slice(0, 10);

  const recentRows = recentRecords.length === 0
    ? '<li class="recent-item" style="color:var(--text-muted);font-size:13px;">データなし</li>'
    : recentRecords.map(r => {
        const st = getStatus(r);
        const wm = calcWorkMinutes(r.clock_in, r.clock_out, r.break_minutes);
        return `<li class="recent-item">
          <span class="ri-name">${r.employee_name}</span>
          <span class="ri-date">${formatDate(r.date)}</span>
          <span class="ri-time">${r.clock_in || '--:--'} → ${r.clock_out || '--:--'}</span>
          <span class="ri-status"><span class="badge ${st.cssClass}">${st.label}</span></span>
          <button class="btn btn-ghost btn-sm" onclick="loadRecord('${r.employee_id}','${r.date}')">編集</button>
        </li>`;
      }).join('');

  return `
    <div class="page-header">
      <div class="page-title">✏️ 勤怠入力</div>
      <div class="page-desc">従業員の出退勤情報を入力・編集します</div>
    </div>

    <div class="card">
      <div class="card-title">勤怠登録フォーム</div>
      <div id="save-notice" class="form-saved-notice">✅ 保存しました</div>

      <div class="form-grid">
        <div class="form-group" id="fg-employee">
          <label>従業員名 <span style="color:var(--danger)">*</span></label>
          <select id="inp-employee">${empOptions}</select>
          <span class="error-msg" id="err-employee"></span>
        </div>
        <div class="form-group" id="fg-date">
          <label>日付 <span style="color:var(--danger)">*</span></label>
          <input type="date" id="inp-date" value="${today}" max="${today}">
          <span class="error-msg" id="err-date"></span>
        </div>
        <div class="form-group">
          <label>出勤時刻</label>
          <input type="time" id="inp-clock-in" value="08:30">
        </div>
        <div class="form-group">
          <label>退勤時刻</label>
          <input type="time" id="inp-clock-out" value="17:30">
        </div>
        <div class="form-group">
          <label>休憩時間（分）</label>
          <input type="number" id="inp-break" value="60" min="0" max="480">
        </div>
        <div class="form-group full">
          <label>備考</label>
          <textarea id="inp-note" placeholder="特記事項があれば入力"></textarea>
        </div>
      </div>

      <div id="calc-preview" class="mt-16" style="font-size:13px;color:var(--text-muted);"></div>

      <div class="btn-row">
        <button class="btn btn-primary" id="btn-save">💾 保存する</button>
        <button class="btn btn-ghost" id="btn-reset">クリア</button>
        <span id="load-notice" style="font-size:12px;color:var(--primary);"></span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">最近の入力履歴（直近10件）</div>
      <ul class="recent-list" id="recent-list">${recentRows}</ul>
    </div>
  `;
}

function bindInputEvents() {
  const empSel   = document.getElementById('inp-employee');
  const dateInp  = document.getElementById('inp-date');
  const inInp    = document.getElementById('inp-clock-in');
  const outInp   = document.getElementById('inp-clock-out');
  const brkInp   = document.getElementById('inp-break');
  const noteInp  = document.getElementById('inp-note');
  const saveBtn  = document.getElementById('btn-save');
  const resetBtn = document.getElementById('btn-reset');

  // 日付・社員変更で既存データロード
  function tryAutoLoad() {
    const empId = empSel.value;
    const date  = dateInp.value;
    if (!empId || !date) return;
    const rec = getRecordByEmployeeDate(empId, date);
    if (rec) {
      inInp.value  = rec.clock_in  || '';
      outInp.value = rec.clock_out || '';
      brkInp.value = rec.break_minutes != null ? rec.break_minutes : 60;
      noteInp.value = rec.note || '';
      document.getElementById('load-notice').textContent = '既存データを読み込みました（編集モード）';
    } else {
      document.getElementById('load-notice').textContent = '';
    }
    updateCalcPreview();
  }

  empSel.addEventListener('change', tryAutoLoad);
  dateInp.addEventListener('change', tryAutoLoad);

  // 計算プレビュー更新
  function updateCalcPreview() {
    const wm = calcWorkMinutes(inInp.value, outInp.value, parseInt(brkInp.value) || 0);
    const preview = document.getElementById('calc-preview');
    if (wm === null) {
      preview.textContent = '';
    } else {
      const ot = calcOvertimeMinutes(wm);
      preview.innerHTML = `計算結果: 労働時間 <strong>${minutesToHHMM(wm)}</strong> ／ 残業 <strong>${minutesToHHMM(ot)}</strong>`;
    }
  }

  [inInp, outInp, brkInp].forEach(el => el.addEventListener('change', updateCalcPreview));

  // 初期ロード
  tryAutoLoad();

  // 保存
  saveBtn.addEventListener('click', () => {
    let valid = true;
    // バリデーション
    if (!empSel.value) {
      document.getElementById('err-employee').textContent = '従業員を選択してください';
      document.getElementById('fg-employee').classList.add('field-error');
      valid = false;
    } else {
      document.getElementById('err-employee').textContent = '';
      document.getElementById('fg-employee').classList.remove('field-error');
    }
    if (!dateInp.value) {
      document.getElementById('err-date').textContent = '日付を入力してください';
      document.getElementById('fg-date').classList.add('field-error');
      valid = false;
    } else {
      document.getElementById('err-date').textContent = '';
      document.getElementById('fg-date').classList.remove('field-error');
    }
    if (!valid) return;

    const selOpt = empSel.options[empSel.selectedIndex];
    upsertRecord({
      employee_id:   empSel.value,
      employee_name: selOpt.dataset.name,
      date:          dateInp.value,
      clock_in:      inInp.value  || '',
      clock_out:     outInp.value || '',
      break_minutes: parseInt(brkInp.value) || 0,
      note:          noteInp.value || '',
    });

    // 保存通知
    const notice = document.getElementById('save-notice');
    notice.classList.add('show');
    setTimeout(() => notice.classList.remove('show'), 3000);

    // 履歴更新
    document.getElementById('recent-list').innerHTML = getRecords()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .map(r => {
        const st = getStatus(r);
        return `<li class="recent-item">
          <span class="ri-name">${r.employee_name}</span>
          <span class="ri-date">${formatDate(r.date)}</span>
          <span class="ri-time">${r.clock_in || '--:--'} → ${r.clock_out || '--:--'}</span>
          <span class="ri-status"><span class="badge ${st.cssClass}">${st.label}</span></span>
          <button class="btn btn-ghost btn-sm" onclick="loadRecord('${r.employee_id}','${r.date}')">編集</button>
        </li>`;
      }).join('');

    updateAnomalyBadge();
  });

  // クリア
  resetBtn.addEventListener('click', () => {
    inInp.value  = '08:30';
    outInp.value = '17:30';
    brkInp.value = '60';
    noteInp.value = '';
    document.getElementById('load-notice').textContent = '';
    document.getElementById('calc-preview').textContent = '';
  });
}

/** 履歴の「編集」ボタンから呼ばれる */
function loadRecord(employeeId, date) {
  const empSel  = document.getElementById('inp-employee');
  const dateInp = document.getElementById('inp-date');
  if (!empSel || !dateInp) return;
  empSel.value  = employeeId;
  dateInp.value = date;
  empSel.dispatchEvent(new Event('change'));
  dateInp.dispatchEvent(new Event('change'));
  window.scrollTo(0, 0);
}

// ================================
// 2. 日次一覧画面
// ================================
function renderDailyView(filterDate) {
  const date = filterDate || todayStr();
  const records = getRecords().filter(r => r.date === date);

  const rows = records.length === 0
    ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📭</div><p>この日のデータがありません</p></div></td></tr>`
    : records.sort((a, b) => a.employee_name.localeCompare(b.employee_name))
        .map(r => {
          const wm = calcWorkMinutes(r.clock_in, r.clock_out, r.break_minutes);
          const ot = calcOvertimeMinutes(wm);
          const st = getStatus(r);
          const anomalies = detectAnomalies(r);
          const rowClass = anomalies.includes(ANOMALY.NO_CLOCK_IN) || anomalies.includes(ANOMALY.INVALID_CLOCK)
            ? 'row-danger'
            : anomalies.length > 0 ? 'row-warning' : '';
          return `<tr class="${rowClass}">
            <td><strong>${r.employee_name}</strong></td>
            <td>${r.clock_in  || '<span class="text-danger">未入力</span>'}</td>
            <td>${r.clock_out || '<span class="text-danger">未入力</span>'}</td>
            <td>${r.break_minutes != null && r.break_minutes !== '' ? r.break_minutes + '分' : '<span class="text-muted">-</span>'}</td>
            <td class="text-right">${minutesToHHMM(wm)}</td>
            <td class="text-right">${ot !== null && ot > 0 ? '<span class="text-danger font-bold">' + minutesToHHMM(ot) + '</span>' : minutesToHHMM(ot)}</td>
            <td><span class="badge ${st.cssClass}">${st.label}</span></td>
            <td>${r.note || ''}</td>
          </tr>`;
        }).join('');

  // 統計
  const normal  = records.filter(r => detectAnomalies(r).length === 0).length;
  const abnormal = records.filter(r => detectAnomalies(r).length > 0).length;

  return `
    <div class="page-header">
      <div class="page-title">📋 日次一覧</div>
      <div class="page-desc">選択した日の全従業員の勤怠状況を確認します</div>
    </div>

    <div class="filter-bar">
      <label>日付</label>
      <input type="date" id="filter-date" value="${date}" max="${todayStr()}">
      <button class="btn btn-primary btn-sm" id="btn-filter-daily">絞り込む</button>
      <span style="margin-left:auto;font-size:13px;color:var(--text-muted);">
        正常: <strong class="text-success">${normal}名</strong>
        要確認: <strong class="text-danger">${abnormal}名</strong>
      </span>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>従業員名</th>
              <th>出勤</th>
              <th>退勤</th>
              <th>休憩</th>
              <th class="text-right">労働時間</th>
              <th class="text-right">残業時間</th>
              <th>状態</th>
              <th>備考</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function bindDailyEvents() {
  document.getElementById('btn-filter-daily').addEventListener('click', () => {
    const date = document.getElementById('filter-date').value;
    document.getElementById('content').innerHTML = renderDailyView(date);
    bindDailyEvents();
  });
  document.getElementById('filter-date').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-filter-daily').click();
  });
}

// ================================
// 3. 月次集計画面
// ================================
function renderMonthlyView(filterMonth) {
  const month = filterMonth || currentMonthStr();
  const [year, mon] = month.split('-').map(Number);
  const records = getRecords();
  const summary = calcMonthlySummary(records, year, mon);

  // 全体統計
  const totalDays = summary.reduce((s, r) => s + r.work_days, 0);
  const totalWork = summary.reduce((s, r) => s + r.total_work, 0);
  const totalOT   = summary.reduce((s, r) => s + r.total_overtime, 0);
  const totalMiss = summary.reduce((s, r) => s + r.missing_cnt, 0);

  const rows = summary.map(s => {
    return `<tr>
      <td><strong>${s.employee_name}</strong></td>
      <td class="text-center">${s.work_days}日</td>
      <td class="text-right">${minutesToHHMM(s.total_work)}</td>
      <td class="text-right">${s.total_overtime > 0 ? '<span class="text-danger font-bold">' + minutesToHHMM(s.total_overtime) + '</span>' : '0:00'}</td>
      <td class="text-center">${s.missing_cnt > 0 ? '<span class="badge badge-danger">' + s.missing_cnt + '件</span>' : '<span class="badge badge-ok">0件</span>'}</td>
    </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div class="page-title">📊 月次集計</div>
      <div class="page-desc">月単位の社員別勤怠集計。CSVエクスポートが可能です</div>
    </div>

    <div class="filter-bar">
      <label>対象月</label>
      <input type="month" id="filter-month" value="${month}">
      <button class="btn btn-primary btn-sm" id="btn-filter-month">集計する</button>
      <button class="btn btn-outline btn-sm" id="btn-export-monthly" style="margin-left:auto;">📥 CSVエクスポート</button>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <div class="sc-label">総出勤日数（延べ）</div>
        <div class="sc-value">${totalDays}<span class="sc-unit">日</span></div>
      </div>
      <div class="summary-card">
        <div class="sc-label">総労働時間</div>
        <div class="sc-value">${minutesToHHMM(totalWork)}<span class="sc-unit"></span></div>
      </div>
      <div class="summary-card">
        <div class="sc-label">総残業時間</div>
        <div class="sc-value" style="color:${totalOT > 0 ? 'var(--danger)' : 'inherit'}">${minutesToHHMM(totalOT)}</div>
      </div>
      <div class="summary-card">
        <div class="sc-label">打刻漏れ（延べ）</div>
        <div class="sc-value" style="color:${totalMiss > 0 ? 'var(--warning)' : 'inherit'}">${totalMiss}<span class="sc-unit">件</span></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">${year}年${mon}月 — 社員別集計</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>従業員名</th>
              <th class="text-center">出勤日数</th>
              <th class="text-right">総労働時間</th>
              <th class="text-right">総残業時間</th>
              <th class="text-center">打刻漏れ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function bindMonthlyEvents() {
  document.getElementById('btn-filter-month').addEventListener('click', () => {
    const month = document.getElementById('filter-month').value;
    document.getElementById('content').innerHTML = renderMonthlyView(month);
    bindMonthlyEvents();
  });

  document.getElementById('btn-export-monthly').addEventListener('click', () => {
    const month = document.getElementById('filter-month').value;
    const [year, mon] = month.split('-').map(Number);
    const summary = calcMonthlySummary(getRecords(), year, mon);

    const headers = ['従業員ID', '従業員名', '出勤日数', '総労働時間(分)', '総残業時間(分)', '打刻漏れ件数'];
    const rows = summary.map(s => [
      s.employee_id, s.employee_name, s.work_days,
      s.total_work, s.total_overtime, s.missing_cnt,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    downloadCSV(csv, `月次集計_${month}.csv`);
    showToast('月次集計CSVをエクスポートしました', 'success');
  });
}

// ================================
// 4. 異常値一覧画面
// ================================
function renderAnomalyView(filterType) {
  filterType = filterType || 'all';
  const all = getRecords();

  const anomalyRecords = all.filter(r => {
    const types = detectAnomalies(r);
    if (types.length === 0) return false;
    if (filterType === 'all') return true;
    return types.includes(filterType);
  }).sort((a, b) => b.date.localeCompare(a.date));

  const filterOptions = [
    { value: 'all', label: 'すべての異常' },
    { value: ANOMALY.NO_CLOCK_IN,   label: ANOMALY_LABELS[ANOMALY.NO_CLOCK_IN] },
    { value: ANOMALY.NO_CLOCK_OUT,  label: ANOMALY_LABELS[ANOMALY.NO_CLOCK_OUT] },
    { value: ANOMALY.NO_BREAK,      label: ANOMALY_LABELS[ANOMALY.NO_BREAK] },
    { value: ANOMALY.LONG_WORK,     label: ANOMALY_LABELS[ANOMALY.LONG_WORK] },
    { value: ANOMALY.INVALID_CLOCK, label: ANOMALY_LABELS[ANOMALY.INVALID_CLOCK] },
  ];

  const filterOpts = filterOptions
    .map(o => `<option value="${o.value}" ${o.value === filterType ? 'selected' : ''}>${o.label}</option>`)
    .join('');

  const rows = anomalyRecords.length === 0
    ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">✅</div><p>異常データはありません</p></div></td></tr>`
    : anomalyRecords.map(r => {
        const types    = detectAnomalies(r);
        const wm       = calcWorkMinutes(r.clock_in, r.clock_out, r.break_minutes);
        const hasDanger = types.includes(ANOMALY.NO_CLOCK_IN) || types.includes(ANOMALY.INVALID_CLOCK);
        const rowClass  = hasDanger ? 'row-danger' : 'row-warning';
        const badges = types.map(t => {
          const isDanger = [ANOMALY.NO_CLOCK_IN, ANOMALY.INVALID_CLOCK].includes(t);
          return `<span class="badge ${isDanger ? 'badge-danger' : 'badge-warning'}" style="margin-right:4px;">${ANOMALY_LABELS[t]}</span>`;
        }).join('');

        return `<tr class="${rowClass}">
          <td><strong>${r.employee_name}</strong></td>
          <td>${formatDate(r.date)}</td>
          <td>${r.clock_in  || '<span class="text-danger">未入力</span>'}</td>
          <td>${r.clock_out || '<span class="text-danger">未入力</span>'}</td>
          <td>${r.break_minutes != null ? r.break_minutes + '分' : '-'}</td>
          <td class="text-right">${minutesToHHMM(wm)}</td>
          <td>${badges}</td>
          <td>
            <button class="btn btn-ghost btn-sm"
              onclick="navigate('input');setTimeout(()=>loadRecord('${r.employee_id}','${r.date}'),50)">
              修正
            </button>
          </td>
        </tr>`;
      }).join('');

  return `
    <div class="page-header">
      <div class="page-title">⚠️ 異常値一覧</div>
      <div class="page-desc">打刻漏れ・長時間労働など問題のある勤怠データを一覧表示します</div>
    </div>

    <div class="filter-bar">
      <label>異常種別</label>
      <select id="filter-anomaly-type">${filterOpts}</select>
      <button class="btn btn-primary btn-sm" id="btn-filter-anomaly">絞り込む</button>
      <span style="margin-left:auto;font-size:13px;color:var(--danger);">
        <strong>${anomalyRecords.length}件</strong> の異常データ
      </span>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>従業員名</th>
              <th>日付</th>
              <th>出勤</th>
              <th>退勤</th>
              <th>休憩</th>
              <th class="text-right">労働時間</th>
              <th>異常内容</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function bindAnomalyEvents() {
  document.getElementById('btn-filter-anomaly').addEventListener('click', () => {
    const type = document.getElementById('filter-anomaly-type').value;
    document.getElementById('content').innerHTML = renderAnomalyView(type);
    bindAnomalyEvents();
  });
}

// ================================
// 5. CSV管理画面
// ================================
function renderCSVView() {
  return `
    <div class="page-header">
      <div class="page-title">📁 CSV管理</div>
      <div class="page-desc">既存のExcel/CSV運用からのデータ移行・エクスポートができます</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">

      <!-- インポート -->
      <div class="card">
        <div class="card-title">📤 CSVインポート</div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
          指定フォーマットのCSVファイルを取り込みます。<br>
          同じ従業員×日付のデータは上書きされます。
        </p>

        <div class="csv-drop-area" id="drop-area">
          <div class="drop-icon">📂</div>
          <p>クリックまたはドラッグ＆ドロップ</p>
          <input type="file" id="csv-file-input" accept=".csv" style="display:none">
          <button class="btn btn-outline" onclick="document.getElementById('csv-file-input').click()">
            ファイルを選択
          </button>
        </div>

        <div id="import-result" class="import-result"></div>

        <div id="import-preview" class="csv-import-preview"></div>

        <div class="btn-row" id="import-btn-row" style="display:none;">
          <button class="btn btn-primary" id="btn-import-confirm">取り込む</button>
          <button class="btn btn-ghost"   id="btn-import-cancel">キャンセル</button>
        </div>
      </div>

      <!-- エクスポート -->
      <div class="card">
        <div class="card-title">📥 CSVエクスポート</div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
          現在のデータをCSVでダウンロードします。<br>
          Excelで開いて加工できます。
        </p>

        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
          <button class="btn btn-success" id="btn-export-all">
            📥 全データをエクスポート（${getRecords().length}件）
          </button>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="month" id="export-month" value="${currentMonthStr()}" style="flex:1;">
            <button class="btn btn-outline" id="btn-export-month">月別エクスポート</button>
          </div>
        </div>

        <hr style="border:none;border-top:1px solid var(--border);margin:20px 0;">

        <div class="card-title" style="font-size:13px;">サンプルCSVダウンロード</div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">
          インポート用のフォーマットを確認できます。
        </p>
        <button class="btn btn-ghost" id="btn-download-sample">
          📄 サンプルCSVをダウンロード
        </button>
      </div>
    </div>

    <!-- フォーマット説明 -->
    <div class="card mt-16" style="margin-top:20px;">
      <div class="card-title">CSVフォーマット仕様</div>
      <table style="font-size:13px;">
        <thead>
          <tr>
            <th>列名</th><th>必須</th><th>形式・例</th><th>説明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>employee_id</code></td><td><span class="badge badge-danger">必須</span></td><td>EMP001</td><td>従業員ID</td></tr>
          <tr><td><code>employee_name</code></td><td><span class="badge badge-danger">必須</span></td><td>田中 太郎</td><td>従業員名</td></tr>
          <tr><td><code>date</code></td><td><span class="badge badge-danger">必須</span></td><td>2026-03-01</td><td>日付（YYYY-MM-DD）</td></tr>
          <tr><td><code>clock_in</code></td><td><span class="badge badge-muted">任意</span></td><td>08:30</td><td>出勤時刻（HH:MM）</td></tr>
          <tr><td><code>clock_out</code></td><td><span class="badge badge-muted">任意</span></td><td>17:30</td><td>退勤時刻（HH:MM）</td></tr>
          <tr><td><code>break_minutes</code></td><td><span class="badge badge-muted">任意</span></td><td>60</td><td>休憩時間（分・整数）</td></tr>
          <tr><td><code>note</code></td><td><span class="badge badge-muted">任意</span></td><td>残業対応</td><td>備考・メモ</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function bindCSVEvents() {
  let pendingRecords = [];

  // ファイル選択
  const fileInput = document.getElementById('csv-file-input');
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) processCSVFile(file);
  });

  // ドラッグ＆ドロップ
  const dropArea = document.getElementById('drop-area');
  dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processCSVFile(file);
  });

  function processCSVFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      const { records, errors } = parseCSV(text);

      const resultEl  = document.getElementById('import-result');
      const previewEl = document.getElementById('import-preview');
      const btnRow    = document.getElementById('import-btn-row');

      if (errors.length > 0) {
        resultEl.className = 'import-result error show';
        resultEl.innerHTML = `<strong>⚠️ エラー（${errors.length}件）:</strong><br>${errors.join('<br>')}`;
        previewEl.innerHTML = '';
        btnRow.style.display = 'none';
        pendingRecords = [];
        return;
      }

      pendingRecords = records;
      resultEl.className = 'import-result success show';
      resultEl.innerHTML = `✅ <strong>${records.length}件</strong> のデータを読み込みました。内容を確認して「取り込む」を押してください。`;

      // プレビュー（先頭5件）
      const preview = records.slice(0, 5);
      previewEl.innerHTML = `
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">プレビュー（先頭5件）</p>
        <div class="table-wrap">
          <table style="font-size:12px;">
            <thead><tr><th>社員</th><th>日付</th><th>出勤</th><th>退勤</th><th>休憩</th></tr></thead>
            <tbody>
              ${preview.map(r => `<tr>
                <td>${r.employee_name}</td><td>${r.date}</td>
                <td>${r.clock_in||'-'}</td><td>${r.clock_out||'-'}</td><td>${r.break_minutes||0}分</td>
              </tr>`).join('')}
              ${records.length > 5 ? `<tr><td colspan="5" style="color:var(--text-muted);">...他${records.length - 5}件</td></tr>` : ''}
            </tbody>
          </table>
        </div>`;

      btnRow.style.display = 'flex';
    };
    reader.readAsText(file, 'UTF-8');
  }

  // インポート確定
  document.getElementById('btn-import-confirm').addEventListener('click', () => {
    if (pendingRecords.length === 0) return;
    importRecords(pendingRecords);
    const resultEl = document.getElementById('import-result');
    resultEl.className = 'import-result success show';
    resultEl.innerHTML = `✅ <strong>${pendingRecords.length}件</strong> を取り込みました！`;
    document.getElementById('import-preview').innerHTML = '';
    document.getElementById('import-btn-row').style.display = 'none';
    pendingRecords = [];
    updateAnomalyBadge();
    showToast(`${pendingRecords.length || 'データ'}を取り込みました`, 'success');
    // エクスポートボタンの件数更新
    const exportBtn = document.getElementById('btn-export-all');
    if (exportBtn) exportBtn.textContent = `📥 全データをエクスポート（${getRecords().length}件）`;
  });

  // キャンセル
  document.getElementById('btn-import-cancel').addEventListener('click', () => {
    pendingRecords = [];
    document.getElementById('import-result').className = 'import-result';
    document.getElementById('import-preview').innerHTML = '';
    document.getElementById('import-btn-row').style.display = 'none';
    document.getElementById('csv-file-input').value = '';
  });

  // 全データエクスポート
  document.getElementById('btn-export-all').addEventListener('click', () => {
    const csv = recordsToCSV(getRecords().sort((a, b) => a.date.localeCompare(b.date)));
    downloadCSV(csv, `勤怠データ_全件_${todayStr()}.csv`);
    showToast('全データをエクスポートしました', 'success');
  });

  // 月別エクスポート
  document.getElementById('btn-export-month').addEventListener('click', () => {
    const month = document.getElementById('export-month').value;
    const records = getRecords().filter(r => r.date.startsWith(month))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (records.length === 0) { showToast('対象月のデータがありません', 'error'); return; }
    const csv = recordsToCSV(records);
    downloadCSV(csv, `勤怠データ_${month}.csv`);
    showToast(`${records.length}件をエクスポートしました`, 'success');
  });

  // サンプルCSVダウンロード
  document.getElementById('btn-download-sample').addEventListener('click', () => {
    const sample = [
      'employee_id,employee_name,date,clock_in,clock_out,break_minutes,note',
      'EMP001,田中 太郎,2026-04-01,08:30,17:30,60,',
      'EMP001,田中 太郎,2026-04-02,08:45,18:00,60,残業あり',
      'EMP002,鈴木 花子,2026-04-01,09:00,18:00,60,',
      'EMP002,鈴木 花子,2026-04-02,,,,欠勤',
      'EMP003,佐藤 次郎,2026-04-01,08:00,17:00,60,',
    ].join('\n');
    downloadCSV(sample, 'sample_attendance.csv');
    showToast('サンプルCSVをダウンロードしました', 'success');
  });
}

// ================================
// サイドバー異常件数バッジ
// ================================
function updateAnomalyBadge() {
  const count = getRecords().filter(r => detectAnomalies(r).length > 0).length;
  const badge = document.getElementById('anomaly-count');
  if (badge) badge.textContent = count > 0 ? count : '';
}

// ================================
// トースト通知
// ================================
function showToast(message, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast${type ? ' toast-' + type : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
