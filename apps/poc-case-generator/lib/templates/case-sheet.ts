import type { PocFull } from "../db";

function calcSavings(m: NonNullable<PocFull["metrics"]>) {
  const checkSave = (m.before_check_time_min - m.after_dashboard_check_time_min);
  const inspectionSave = (m.before_inspection_time_min - m.after_dashboard_check_time_min);
  const transcriptionSave = (m.before_transcription_time_min - m.after_transcription_time_min);
  const totalMinSaved = Math.max(0, checkSave) + Math.max(0, transcriptionSave);
  const weeklyMinSaved = totalMinSaved * 5;
  return { checkSave, transcriptionSave, totalMinSaved, weeklyMinSaved };
}

export function generateCaseSheet(poc: PocFull): string {
  const { project: p, metrics: m, comments: c } = poc;
  const period = p.start_date && p.end_date
    ? `${p.start_date} 〜 ${p.end_date}`
    : p.start_date || "期間未設定";

  const effectLines: string[] = [];
  if (m) {
    const { checkSave, transcriptionSave, weeklyMinSaved } = calcSavings(m);
    if (checkSave > 0) effectLines.push(`- 作業確認時間：${m.before_check_time_min}分/日 → ${m.after_dashboard_check_time_min}分/日（**${checkSave}分/日削減**）`);
    if (m.after_unperformed_discovery_sec > 0) effectLines.push(`- 未実施発見：${m.before_issue_discovery_min}分 → ${m.after_unperformed_discovery_sec}秒以内`);
    if (m.after_ng_grasp_sec > 0) effectLines.push(`- NG把握：${m.before_ng_steps}ステップ → ${m.after_ng_grasp_sec}秒以内`);
    if (transcriptionSave > 0) effectLines.push(`- 転記時間：${m.before_transcription_time_min}分 → ${m.after_transcription_time_min}分（**${transcriptionSave}分削減**）`);
    if (m.before_error_count > 0 && m.after_error_count < m.before_error_count) effectLines.push(`- ミス・修正：${m.before_error_count}件 → ${m.after_error_count}件`);
    if (weeklyMinSaved > 0) effectLines.push(`- **週間削減時間：約${weeklyMinSaved}分（${Math.round(weeklyMinSaved / 60 * 10) / 10}時間）**`);
    if (m.satisfaction_score > 0) effectLines.push(`- 管理者満足度：${m.satisfaction_score}/5`);
    if (m.continuation_score > 0) effectLines.push(`- 継続利用意向：${m.continuation_score}/5`);
  }

  const relatedApps = p.related_apps
    ? `（使用アプリ：${p.related_apps}）`
    : "";

  return `# 導入事例：${p.title}

## 基本情報

| 項目 | 内容 |
|------|------|
| 対象会社 | ${p.company_name || "非公開"} |
| 対象部署 | ${p.department || "―"} |
| 対象業務 | ${p.target_workflow || "―"} |
| 利用人数 | ${p.user_count > 0 ? `${p.user_count}名` : "―"} |
| 実施期間 | ${period} |
| 関連アプリ | ${p.related_apps || "―"} |
| 業種・規模 | ${p.target_industry || "―"} |

---

## 導入前の課題 ${relatedApps}

${m ? `- 作業確認に **${m.before_check_time_min}分/日** かかっていた
- 点検状況の確認に **${m.before_inspection_time_min}分/日** かかっていた
- 問題発見まで **${m.before_issue_discovery_min}分** かかっていた
- NG確認に **${m.before_ng_steps}ステップ** 必要だった
- 参照するファイル・画面が **${m.before_files_count}つ** あり煩雑だった
- 転記作業に **${m.before_transcription_time_min}分** かかっていた
- ミス・修正が **月${m.before_error_count}件** 発生していた` : "（数値未入力）"}

---

## 導入後の効果

${effectLines.length > 0 ? effectLines.join("\n") : "（数値未入力）"}

---

## 現場の声

${c?.user_voice ? `> "${c.user_voice}"` : "（コメント未入力）"}

**良かった点：** ${c?.good_points || "―"}

**改善要望：** ${c?.requests || "―"}

---

## こんな会社に向いています

${p.target_industry || "製造業・物流・建設業など"}の中小企業で、

- 複数のアプリ・ファイルを行き来しながら管理している
- 管理者が現場状況をリアルタイムで把握できていない
- Excelや紙での運用に限界を感じている
- ITツールに詳しくないが、業務効率化したい

というケースに特に効果的です。

---

## 導入の流れ

1. **ヒアリング**（1〜2時間）：業務フローの把握
2. **MVP構築**（3〜5日）：最小機能で動く状態
3. **試験運用**（2〜4週間）：現場での実際の使用
4. **効果測定**：Before/Afterの数値化
5. **本格導入または横展開**

---

## 価格目安

${p.price_estimate || "初期費用 0円 / 月額 5,000〜20,000円（規模・機能に応じて相談）"}

---

## 次のアクション

${c?.next_action || "お気軽にご相談ください。"}

---

*作成日：${new Date().toLocaleDateString("ja-JP")}*
`;
}

export function generatePlainText(poc: PocFull): string {
  const md = generateCaseSheet(poc);
  return md
    .replace(/^#{1,6}\s/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\|.*\|/g, (line) =>
      line.split("|").filter(Boolean).map(s => s.trim()).join("  /  ")
    )
    .replace(/^[-*]\s/gm, "・")
    .replace(/^>\s/gm, "「")
    .replace(/---/g, "──────────────────")
    .trim();
}
