"use client";
import Link from "next/link"

import { useState } from "react";
import { useRouter } from "next/navigation";

const RELATED_APPS = ["App1（作業実績）", "App2（点検）", "App3（ダッシュボード）", "その他"];
const STATUSES = ["ヒアリング中", "PoC中", "事例化済み", "提案済み", "受注済み"];

export default function NewPocPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company_name: "",
    department: "",
    target_workflow: "",
    related_apps: "",
    start_date: "",
    end_date: "",
    user_count: "",
    status: "ヒアリング中",
    price_estimate: "",
    target_industry: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const toggleApp = (app: string) => {
    const current = form.related_apps ? form.related_apps.split(",").map(s => s.trim()) : [];
    if (current.includes(app)) {
      set("related_apps", current.filter(a => a !== app).join(", "));
    } else {
      set("related_apps", [...current, app].join(", "));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { alert("PoC名を入力してください"); return; }
    setSaving(true);
    const res = await fetch("/api/poc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, user_count: Number(form.user_count) || 0 }),
    });
    const created = await res.json();
    router.push(`/poc/${created.id}`);
  };

  const selectedApps = form.related_apps ? form.related_apps.split(",").map(s => s.trim()) : [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">PoC一覧</Link>
        <span>/</span>
        <span className="text-gray-900">新規PoC登録</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">新規PoC登録</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PoC名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="例：作業実績入力アプリ導入PoC"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">対象会社名</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
                placeholder="例：○○製作所"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">対象部署</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="例：製造管理部"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">対象業務</label>
              <input
                type="text"
                value={form.target_workflow}
                onChange={(e) => set("target_workflow", e.target.value)}
                placeholder="例：日次作業実績管理"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">業種・規模</label>
              <input
                type="text"
                value={form.target_industry}
                onChange={(e) => set("target_industry", e.target.value)}
                placeholder="例：製造業・従業員30名"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">関連アプリ</label>
            <div className="flex gap-2 flex-wrap">
              {RELATED_APPS.map((app) => (
                <button
                  key={app}
                  type="button"
                  onClick={() => toggleApp(app)}
                  className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                    selectedApps.includes(app)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">利用人数</label>
              <input
                type="number"
                value={form.user_count}
                onChange={(e) => set("user_count", e.target.value)}
                min="0"
                placeholder="0"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">価格目安</label>
              <input
                type="text"
                value={form.price_estimate}
                onChange={(e) => set("price_estimate", e.target.value)}
                placeholder="例：月額10,000円"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <a href="/" className="flex-1 text-center border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 text-sm">
              キャンセル
            </a>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "保存中..." : "登録して詳細入力へ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
