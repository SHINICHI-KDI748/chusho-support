"use client";
import Link from "next/link"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { PocFull } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const RELATED_APPS = ["App1（作業実績）", "App2（点検）", "App3（ダッシュボード）", "その他"];
const STATUSES = ["ヒアリング中", "PoC中", "事例化済み", "提案済み", "受注済み"];
type Tab = "basic" | "metrics" | "comments";

const SCORE_LABELS = ["未入力", "1：不満", "2：やや不満", "3：普通", "4：満足", "5：とても満足"];
const CONTINUE_LABELS = ["未入力", "1：使わない", "2：微妙", "3：どちらでも", "4：使いたい", "5：ぜひ使いたい"];

export default function PocDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("basic");

  const [project, setProject] = useState({
    title: "", company_name: "", department: "", target_workflow: "",
    related_apps: "", start_date: "", end_date: "", user_count: "",
    status: "ヒアリング中", price_estimate: "", target_industry: "",
  });

  const [metrics, setMetrics] = useState({
    before_check_time_min: "", before_inspection_time_min: "", before_issue_discovery_min: "",
    before_ng_steps: "", before_files_count: "", before_transcription_time_min: "", before_error_count: "",
    after_dashboard_check_time_min: "", after_unperformed_discovery_sec: "", after_ng_grasp_sec: "",
    after_transcription_time_min: "", after_error_count: "",
    satisfaction_score: "0", continuation_score: "0",
  });

  const [comments, setComments] = useState({
    good_points: "", bad_points: "", requests: "", user_voice: "",
    reason_to_continue: "", next_action: "",
  });

  useEffect(() => {
    fetch(`${BASE}/api/poc/${id}`)
      .then((r) => r.json())
      .then((data: PocFull) => {
        const p = data.project;
        setProject({
          title: p.title, company_name: p.company_name, department: p.department,
          target_workflow: p.target_workflow, related_apps: p.related_apps,
          start_date: p.start_date, end_date: p.end_date,
          user_count: p.user_count > 0 ? String(p.user_count) : "",
          status: p.status, price_estimate: p.price_estimate, target_industry: p.target_industry,
        });
        if (data.metrics) {
          const m = data.metrics;
          setMetrics({
            before_check_time_min: m.before_check_time_min > 0 ? String(m.before_check_time_min) : "",
            before_inspection_time_min: m.before_inspection_time_min > 0 ? String(m.before_inspection_time_min) : "",
            before_issue_discovery_min: m.before_issue_discovery_min > 0 ? String(m.before_issue_discovery_min) : "",
            before_ng_steps: m.before_ng_steps > 0 ? String(m.before_ng_steps) : "",
            before_files_count: m.before_files_count > 0 ? String(m.before_files_count) : "",
            before_transcription_time_min: m.before_transcription_time_min > 0 ? String(m.before_transcription_time_min) : "",
            before_error_count: m.before_error_count > 0 ? String(m.before_error_count) : "",
            after_dashboard_check_time_min: m.after_dashboard_check_time_min > 0 ? String(m.after_dashboard_check_time_min) : "",
            after_unperformed_discovery_sec: m.after_unperformed_discovery_sec > 0 ? String(m.after_unperformed_discovery_sec) : "",
            after_ng_grasp_sec: m.after_ng_grasp_sec > 0 ? String(m.after_ng_grasp_sec) : "",
            after_transcription_time_min: m.after_transcription_time_min > 0 ? String(m.after_transcription_time_min) : "",
            after_error_count: m.after_error_count >= 0 ? String(m.after_error_count) : "",
            satisfaction_score: String(m.satisfaction_score),
            continuation_score: String(m.continuation_score),
          });
        }
        if (data.comments) {
          const c = data.comments;
          setComments({
            good_points: c.good_points, bad_points: c.bad_points, requests: c.requests,
            user_voice: c.user_voice, reason_to_continue: c.reason_to_continue, next_action: c.next_action,
          });
        }
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`${BASE}/api/poc/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: { ...project, user_count: Number(project.user_count) || 0 },
        metrics: Object.fromEntries(
          Object.entries(metrics).map(([k, v]) => [k, Number(v) || 0])
        ),
        comments,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setP = (k: string, v: string) => setProject((f) => ({ ...f, [k]: v }));
  const setM = (k: string, v: string) => setMetrics((f) => ({ ...f, [k]: v }));
  const setC = (k: string, v: string) => setComments((f) => ({ ...f, [k]: v }));

  const toggleApp = (app: string) => {
    const current = project.related_apps ? project.related_apps.split(",").map((s) => s.trim()) : [];
    if (current.includes(app)) {
      setP("related_apps", current.filter((a) => a !== app).join(", "));
    } else {
      setP("related_apps", [...current, app].join(", "));
    }
  };
  const selectedApps = project.related_apps ? project.related_apps.split(",").map((s) => s.trim()) : [];

  // Before/After auto-diff
  const checkSave = (Number(metrics.before_check_time_min) || 0) - (Number(metrics.after_dashboard_check_time_min) || 0);
  const transcSave = (Number(metrics.before_transcription_time_min) || 0) - (Number(metrics.after_transcription_time_min) || 0);
  const weeklyMinSaved = (Math.max(0, checkSave) + Math.max(0, transcSave)) * 5;

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">PoC一覧</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{project.title || "PoC詳細"}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{project.company_name}{project.department && ` / ${project.department}`}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a
            href={`/poc/${id}/case-sheet`}
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
          >
            事例シート
          </a>
          <a
            href={`/poc/${id}/sales-copy`}
            className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700"
          >
            営業文
          </a>
        </div>
      </div>

      {/* Effect summary bar */}
      {weeklyMinSaved > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4 flex items-center gap-4 text-sm">
          <span className="font-medium text-green-800">効果サマリ</span>
          <span className="text-green-700">週間削減：約 <strong>{weeklyMinSaved}分</strong>（{(weeklyMinSaved / 60).toFixed(1)}時間）</span>
          {metrics.satisfaction_score !== "0" && (
            <span className="text-green-700">満足度：<strong>{metrics.satisfaction_score}/5</strong></span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-0 border-b border-gray-200">
        {(["basic", "metrics", "comments"] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = { basic: "基本情報", metrics: "Before / After 数値", comments: "定性・コメント" };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-b-lg rounded-tr-lg border border-gray-200 border-t-0 p-6">

        {/* --- Tab: 基本情報 --- */}
        {tab === "basic" && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PoC名 <span className="text-red-500">*</span></label>
              <input type="text" value={project.title} onChange={(e) => setP("title", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">対象会社名</label>
                <input type="text" value={project.company_name} onChange={(e) => setP("company_name", e.target.value)}
                  placeholder="例：○○製作所"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">対象部署</label>
                <input type="text" value={project.department} onChange={(e) => setP("department", e.target.value)}
                  placeholder="例：製造管理部"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">対象業務</label>
                <input type="text" value={project.target_workflow} onChange={(e) => setP("target_workflow", e.target.value)}
                  placeholder="例：日次作業実績管理"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">業種・規模</label>
                <input type="text" value={project.target_industry} onChange={(e) => setP("target_industry", e.target.value)}
                  placeholder="例：製造業・従業員30名"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">関連アプリ</label>
              <div className="flex gap-2 flex-wrap">
                {RELATED_APPS.map((app) => (
                  <button key={app} type="button" onClick={() => toggleApp(app)}
                    className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                      selectedApps.includes(app)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}>
                    {app}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                <input type="date" value={project.start_date} onChange={(e) => setP("start_date", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                <input type="date" value={project.end_date} onChange={(e) => setP("end_date", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">利用人数</label>
                <input type="number" value={project.user_count} onChange={(e) => setP("user_count", e.target.value)}
                  min="0" placeholder="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select value={project.status} onChange={(e) => setP("status", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">価格目安</label>
                <input type="text" value={project.price_estimate} onChange={(e) => setP("price_estimate", e.target.value)}
                  placeholder="例：月額10,000円"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* --- Tab: Before / After 数値 --- */}
        {tab === "metrics" && (
          <div className="space-y-6">
            {/* Before */}
            <div>
              <h3 className="text-sm font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded mb-3">
                導入前（Before）
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricInput label="作業確認時間（分/日）" unit="分/日"
                  value={metrics.before_check_time_min} onChange={(v) => setM("before_check_time_min", v)} />
                <MetricInput label="点検状況確認時間（分/日）" unit="分/日"
                  value={metrics.before_inspection_time_min} onChange={(v) => setM("before_inspection_time_min", v)} />
                <MetricInput label="問題発見までの時間（分）" unit="分"
                  value={metrics.before_issue_discovery_min} onChange={(v) => setM("before_issue_discovery_min", v)} />
                <MetricInput label="NG確認のステップ数" unit="ステップ"
                  value={metrics.before_ng_steps} onChange={(v) => setM("before_ng_steps", v)} />
                <MetricInput label="参照ファイル・画面数" unit="つ"
                  value={metrics.before_files_count} onChange={(v) => setM("before_files_count", v)} />
                <MetricInput label="転記時間（分）" unit="分"
                  value={metrics.before_transcription_time_min} onChange={(v) => setM("before_transcription_time_min", v)} />
                <MetricInput label="ミス・修正件数（月）" unit="件"
                  value={metrics.before_error_count} onChange={(v) => setM("before_error_count", v)} />
              </div>
            </div>

            {/* After */}
            <div>
              <h3 className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded mb-3">
                導入後（After）
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricInput label="統合画面確認時間（分/日）" unit="分/日"
                  value={metrics.after_dashboard_check_time_min} onChange={(v) => setM("after_dashboard_check_time_min", v)} />
                <MetricInput label="未実施発見時間（秒）" unit="秒"
                  value={metrics.after_unperformed_discovery_sec} onChange={(v) => setM("after_unperformed_discovery_sec", v)} />
                <MetricInput label="NG把握時間（秒）" unit="秒"
                  value={metrics.after_ng_grasp_sec} onChange={(v) => setM("after_ng_grasp_sec", v)} />
                <MetricInput label="転記時間（分）" unit="分"
                  value={metrics.after_transcription_time_min} onChange={(v) => setM("after_transcription_time_min", v)} />
                <MetricInput label="ミス・修正件数（月）" unit="件"
                  value={metrics.after_error_count} onChange={(v) => setM("after_error_count", v)} />
              </div>
            </div>

            {/* 評価 */}
            <div>
              <h3 className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded mb-3">
                利用者評価
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">管理者満足度</label>
                  <select value={metrics.satisfaction_score} onChange={(e) => setM("satisfaction_score", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                    {SCORE_LABELS.map((l, i) => <option key={i} value={String(i)}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">継続利用意向</label>
                  <select value={metrics.continuation_score} onChange={(e) => setM("continuation_score", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                    {CONTINUE_LABELS.map((l, i) => <option key={i} value={String(i)}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Auto diff preview */}
            {(checkSave !== 0 || transcSave !== 0) && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-gray-700 mb-2">自動計算プレビュー</p>
                <div className="space-y-1 text-gray-600">
                  {checkSave > 0 && <p>・作業確認：<span className="text-green-700 font-medium">{checkSave}分/日削減</span></p>}
                  {checkSave < 0 && <p>・作業確認：<span className="text-red-600">+{Math.abs(checkSave)}分/日増加</span></p>}
                  {transcSave > 0 && <p>・転記：<span className="text-green-700 font-medium">{transcSave}分削減</span></p>}
                  {weeklyMinSaved > 0 && (
                    <p className="mt-2 font-semibold text-green-800">
                      週間削減合計：{weeklyMinSaved}分（{(weeklyMinSaved / 60).toFixed(1)}時間）
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Tab: 定性・コメント --- */}
        {tab === "comments" && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">良かった点</label>
              <textarea value={comments.good_points} onChange={(e) => setC("good_points", e.target.value)}
                rows={3} placeholder="例：画面を開くだけで全体把握できるのが助かった"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">使いにくかった点</label>
              <textarea value={comments.bad_points} onChange={(e) => setC("bad_points", e.target.value)}
                rows={2} placeholder="例：入力項目が多い"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">追加要望</label>
              <textarea value={comments.requests} onChange={(e) => setC("requests", e.target.value)}
                rows={2} placeholder="例：スマホでも見たい"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                印象的なコメント（事例シートに引用）
              </label>
              <textarea value={comments.user_voice} onChange={(e) => setC("user_voice", e.target.value)}
                rows={2} placeholder="例：確認作業が10分から1分になって助かっています"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
              {comments.user_voice && (
                <p className="text-xs text-gray-400 mt-1">
                  プレビュー：「{comments.user_voice}」
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">今後も使いたい理由 / 使いたくない理由</label>
              <textarea value={comments.reason_to_continue} onChange={(e) => setC("reason_to_continue", e.target.value)}
                rows={2} placeholder="例：管理者の手間が減るので継続したい"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">次のアクション</label>
              <textarea value={comments.next_action} onChange={(e) => setC("next_action", e.target.value)}
                rows={2} placeholder="例：2社に紹介予定。来月ヒアリング。"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
          </div>
        )}

        {/* Save bar */}
        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">保存しました</span>}
          <div className="ml-auto flex gap-2">
            <a href={`/poc/${id}/case-sheet`} className="text-sm text-green-600 hover:underline">
              事例シートを見る →
            </a>
            <span className="text-gray-300">|</span>
            <a href={`/poc/${id}/sales-copy`} className="text-sm text-purple-600 hover:underline">
              営業文を生成 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricInput({
  label, unit, value, onChange,
}: {
  label: string; unit: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="0"
          step="0.5"
          placeholder="0"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  );
}
