"use client";
import Link from "next/link"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PocFull } from "@/lib/db";

// Minimal markdown → HTML (covers what generateCaseSheet outputs)
function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inTable = false;
  let inList = false;

  for (const raw of lines) {
    const line = raw;

    // Table separator row — skip
    if (/^\|[-| :]+\|$/.test(line)) continue;

    // Table row
    if (/^\|.+\|$/.test(line)) {
      if (!inTable) { out.push("<table class=\"md-table\">"); inTable = true; }
      const cells = line.split("|").filter((_, i, a) => i > 0 && i < a.length - 1);
      out.push(`<tr>${cells.map((c) => `<td>${applyInline(c.trim())}</td>`).join("")}</tr>`);
      continue;
    } else if (inTable) {
      out.push("</table>"); inTable = false;
    }

    // List item
    if (/^- .+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${applyInline(line.slice(2))}</li>`);
      continue;
    } else if (inList) {
      out.push("</ul>"); inList = false;
    }

    // Headings
    if (/^# /.test(line)) { out.push(`<h1>${applyInline(line.slice(2))}</h1>`); continue; }
    if (/^## /.test(line)) { out.push(`<h2>${applyInline(line.slice(3))}</h2>`); continue; }
    if (/^### /.test(line)) { out.push(`<h3>${applyInline(line.slice(4))}</h3>`); continue; }
    if (/^#### /.test(line)) { out.push(`<h4>${applyInline(line.slice(5))}</h4>`); continue; }

    // HR
    if (line.trim() === "---") { out.push("<hr/>"); continue; }

    // Blockquote
    if (/^> /.test(line)) { out.push(`<blockquote>${applyInline(line.slice(2))}</blockquote>`); continue; }

    // Empty line
    if (line.trim() === "") { out.push(""); continue; }

    // Paragraph
    out.push(`<p>${applyInline(line)}</p>`);
  }
  if (inTable) out.push("</table>");
  if (inList) out.push("</ul>");

  return out.join("\n");
}

function applyInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export default function CaseSheetPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [markdown, setMarkdown] = useState("");
  const [poc, setPoc] = useState<PocFull | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/poc/${id}`).then((r) => r.json()),
      fetch(`/api/poc/${id}/export?format=markdown`).then((r) => r.text()),
    ]).then(([pocData, md]) => {
      setPoc(pocData);
      setMarkdown(md);
      setLoading(false);
    });
  }, [id]);

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-sheet-${id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPlainText = async () => {
    const res = await fetch(`/api/poc/${id}/export?format=plain`);
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">生成中...</div>;

  const title = poc?.project.title || "PoC事例";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 no-print">
        <Link href="/" className="hover:text-blue-600">PoC一覧</Link>
        <span>/</span>
        <a href={`/poc/${id}`} className="hover:text-blue-600">{title}</a>
        <span>/</span>
        <span className="text-gray-900">事例シート</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 no-print">
        <h1 className="text-xl font-bold text-gray-900">事例シート</h1>
        <div className="flex gap-2">
          <button
            onClick={copyPlainText}
            className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50"
          >
            プレーンテキストをコピー
          </button>
          <button
            onClick={copyMarkdown}
            className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50"
          >
            {copied ? "コピー済み！" : "Markdownをコピー"}
          </button>
          <button
            onClick={downloadMarkdown}
            className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50"
          >
            .mdダウンロード
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            印刷 / PDF保存
          </button>
          <a
            href={`/poc/${id}/sales-copy`}
            className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700"
          >
            営業文を生成 →
          </a>
        </div>
      </div>

      {/* Case sheet preview */}
      <div
        className="markdown-preview bg-white rounded-lg border border-gray-200 p-8 print-container"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
      />

      {/* Raw markdown (collapsible) */}
      <details className="mt-6 no-print">
        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 select-none">
          Markdownソースを表示
        </summary>
        <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-auto">
          <pre className="text-xs text-gray-100 whitespace-pre-wrap font-mono">{markdown}</pre>
        </div>
      </details>
    </div>
  );
}
