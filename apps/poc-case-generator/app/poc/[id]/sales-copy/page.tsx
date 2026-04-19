import Link from "next/link"
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type SalesCopies = {
  referral: string;
  firstContact: string;
  lpShort: string;
  threeMinSummary: string;
  oneLiner: string;
};

const COPY_LABELS: { key: keyof SalesCopies; title: string; desc: string; color: string }[] = [
  {
    key: "oneLiner",
    title: "提案時の一言",
    desc: "商談・名刺交換の場で使う1文",
    color: "blue",
  },
  {
    key: "firstContact",
    title: "初回営業メッセージ",
    desc: "メール・DM・チラシ等の初回アプローチ文",
    color: "indigo",
  },
  {
    key: "referral",
    title: "紹介依頼文",
    desc: "既存関係者に別会社を紹介してもらう際のメール文面",
    color: "violet",
  },
  {
    key: "lpShort",
    title: "LP掲載用短文",
    desc: "ランディングページや資料の導入実績欄に使う文",
    color: "purple",
  },
  {
    key: "threeMinSummary",
    title: "3分説明文",
    desc: "口頭説明やプレゼン資料の下書きとして使う構造化テキスト",
    color: "fuchsia",
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50",
  indigo: "border-indigo-200 bg-indigo-50",
  violet: "border-violet-200 bg-violet-50",
  purple: "border-purple-200 bg-purple-50",
  fuchsia: "border-fuchsia-200 bg-fuchsia-50",
};

const BADGE_MAP: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800",
  indigo: "bg-indigo-100 text-indigo-800",
  violet: "bg-violet-100 text-violet-800",
  purple: "bg-purple-100 text-purple-800",
  fuchsia: "bg-fuchsia-100 text-fuchsia-800",
};

export default function SalesCopyPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [copies, setCopies] = useState<SalesCopies | null>(null);
  const [pocTitle, setPocTitle] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    fetch(`/api/poc/${id}/export?format=json`)
      .then((r) => r.json())
      .then((data: { caseSheet: string; salesCopies: SalesCopies }) => {
        setCopies(data.salesCopies);
        setLoading(false);
      });
    fetch(`/api/poc/${id}`)
      .then((r) => r.json())
      .then((d) => setPocTitle(d.project?.title || ""));
  }, [id]);

  const copy = async (key: keyof SalesCopies) => {
    if (!copies) return;
    await navigator.clipboard.writeText(copies[key]);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAll = async () => {
    if (!copies) return;
    const all = COPY_LABELS.map((l) => `【${l.title}】\n${copies[l.key]}`).join("\n\n\n");
    await navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">生成中...</div>;
  if (!copies) return <div className="text-center py-20 text-red-500">データ取得エラー</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">PoC一覧</Link>
        <span>/</span>
        <a href={`/poc/${id}`} className="hover:text-blue-600">{pocTitle}</a>
        <span>/</span>
        <span className="text-gray-900">営業出力</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">営業転用テキスト</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            PoC結果をもとに自動生成しました。コピーしてそのまま使えます。
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyAll}
            className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50"
          >
            {copiedAll ? "全コピー済み！" : "すべてコピー"}
          </button>
          <a
            href={`/poc/${id}/case-sheet`}
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
          >
            ← 事例シートへ
          </a>
        </div>
      </div>

      {/* Copy cards */}
      <div className="space-y-4">
        {COPY_LABELS.map(({ key, title, desc, color }) => (
          <div key={key} className={`rounded-lg border p-5 ${COLOR_MAP[color]}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_MAP[color]}`}>
                  {title}
                </span>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
              <button
                onClick={() => copy(key)}
                className={`text-xs border px-3 py-1.5 rounded font-medium transition-colors shrink-0 ml-4 ${
                  copiedKey === key
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {copiedKey === key ? "コピー済み！" : "コピー"}
              </button>
            </div>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed bg-white/70 rounded p-3 mt-2">
              {copies[key]}
            </pre>
          </div>
        ))}
      </div>

      {/* Back to edit */}
      <div className="mt-8 text-center">
        <a href={`/poc/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← 詳細入力に戻って数値を更新する
        </a>
      </div>
    </div>
  );
}
