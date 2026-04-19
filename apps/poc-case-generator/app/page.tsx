"use client";

import { useEffect, useState } from "react";
import type { PocProject } from "@/lib/db";

const STATUS_COLORS: Record<string, string> = {
  "ヒアリング中": "bg-gray-100 text-gray-700",
  "PoC中": "bg-yellow-100 text-yellow-800",
  "事例化済み": "bg-green-100 text-green-800",
  "提案済み": "bg-blue-100 text-blue-800",
  "受注済み": "bg-purple-100 text-purple-800",
};

const ALL_STATUSES = ["すべて", "ヒアリング中", "PoC中", "事例化済み", "提案済み", "受注済み"];

export default function PocListPage() {
  const [projects, setProjects] = useState<PocProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("すべて");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/poc")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const matchStatus = filter === "すべて" || p.status === filter;
    const matchSearch =
      !search ||
      p.title.includes(search) ||
      p.company_name.includes(search) ||
      p.target_workflow.includes(search);
    return matchStatus && matchSearch;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("このPoCを削除しますか？")) return;
    await fetch(`/api/poc/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PoC一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            全{projects.length}件 / 事例化済み{projects.filter(p => p.status === "事例化済み" || p.status === "受注済み").length}件
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/csv"
            className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50"
          >
            CSVエクスポート
          </a>
          <a
            href="/poc/new"
            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 font-medium"
          >
            + 新規PoC
          </a>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {ALL_STATUSES.slice(1).map((s) => (
          <div key={s} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {projects.filter(p => p.status === s).length}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{s}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="PoC名・会社名・業務で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 max-w-xs focus:outline-none focus:border-blue-400"
        />
        <div className="flex gap-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                filter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* PoC cards */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-4">PoCがまだ登録されていません</div>
          <a
            href="/poc/new"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            最初のPoCを登録する
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-700"}`}>
                      {p.status}
                    </span>
                    {(p.status === "事例化済み" || p.status === "受注済み") && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                        事例あり
                      </span>
                    )}
                  </div>
                  <h2 className="font-semibold text-gray-900 truncate">{p.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>{p.company_name || "会社未設定"}</span>
                    {p.department && <span>/ {p.department}</span>}
                    {p.target_workflow && <span>/ {p.target_workflow}</span>}
                    {p.user_count > 0 && <span>{p.user_count}名</span>}
                  </div>
                  {p.related_apps && (
                    <div className="flex gap-1 mt-1.5">
                      {p.related_apps.split(",").map((app) => (
                        <span key={app} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          {app.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    更新：{p.updated_at?.slice(0, 10) || ""}
                    {p.start_date && ` / 実施：${p.start_date}${p.end_date ? " 〜 " + p.end_date : " 〜"}`}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <a
                    href={`/poc/${p.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    編集
                  </a>
                  <a
                    href={`/poc/${p.id}/case-sheet`}
                    className="text-sm text-green-600 hover:underline"
                  >
                    事例シート
                  </a>
                  <a
                    href={`/poc/${p.id}/sales-copy`}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    営業文
                  </a>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-sm text-red-400 hover:text-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
