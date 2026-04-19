import type { PocFull } from "../db";

function effectSummary(poc: PocFull): string {
  const m = poc.metrics;
  if (!m) return "業務時間の大幅削減";
  const saves: string[] = [];
  const checkSave = m.before_check_time_min - m.after_dashboard_check_time_min;
  if (checkSave > 0) saves.push(`確認作業${checkSave}分/日削減`);
  const weeklyMin = checkSave * 5;
  if (weeklyMin > 60) saves.push(`週${Math.round(weeklyMin / 60 * 10) / 10}時間削減`);
  if (m.after_unperformed_discovery_sec > 0) saves.push(`未実施発見${m.after_unperformed_discovery_sec}秒以内`);
  if (m.after_ng_grasp_sec > 0) saves.push(`NG把握${m.after_ng_grasp_sec}秒以内`);
  if (m.satisfaction_score >= 4) saves.push(`満足度${m.satisfaction_score}/5`);
  return saves.length > 0 ? saves.join("、") : "業務効率化を実現";
}

export function generateSalesCopies(poc: PocFull): {
  referral: string;
  firstContact: string;
  lpShort: string;
  threeMinSummary: string;
  oneLiner: string;
} {
  const p = poc.project;
  const effect = effectSummary(poc);
  const industry = p.target_industry || "製造業系";
  const workflow = p.target_workflow || "業務管理";
  const company = p.company_name || "取引先";
  const voice = poc.comments?.user_voice || "";

  const referral = `件名：業務効率化ツールのご紹介のお願い

お世話になっております。

このたび、${industry}の${workflow}を効率化する小型業務アプリを開発し、
${company}様にてPoC（実証試験）を実施いたしました。

結果として、${effect}を達成することができました。
${voice ? `\nご利用者からは「${voice}」とのお声もいただいています。\n` : ""}
同様の課題をお持ちの企業様へのご紹介をいただけますと大変幸いです。

アプリは導入コスト0円から始められます。
まずは30分のご説明の機会をいただけないでしょうか。

どうぞよろしくお願いいたします。`;

  const firstContact = `はじめまして。

製造業・中小企業向けの業務効率化アプリを開発しております。

先日、${industry}の企業様で${workflow}に関するPoCを実施しまして、
${effect}という結果が出ました。

御社でも同様の課題がないかと思い、ご連絡いたしました。

・初期費用：0円
・導入期間：最短1週間
・効果測定：Before/Afterで数値化してご確認いただけます

まずは無料で現状ヒアリングさせていただければ幸いです。
15〜30分、お時間いただけますでしょうか？`;

  const lpShort = `【導入事例】${p.title}

${industry}の${workflow}に特化した業務アプリを${company}様に導入。
${effect}を実現しました。

✓ 導入費用0円から
✓ 最短1週間で稼働
✓ 効果を数値で確認できる

小さく始めて、確実に効果を出す。製造業向け業務アプリ。`;

  const threeMinSummary = `【3分でわかる】${p.title}

■ どんなアプリ？
${p.target_workflow || "業務管理"}を効率化する、${industry}向けの小型Webアプリです。

■ 導入前の状態
${poc.metrics ? `・確認作業に${poc.metrics.before_check_time_min}分/日かかっていた
・複数のファイルを行き来する手間があった
・ミス・抜け漏れが月${poc.metrics.before_error_count}件程度発生していた` : "複数の手作業が重なり、管理者の負担が大きかった"}

■ 導入後の変化
${effect}

■ 使った人の声
${voice ? `「${voice}」` : "現場からは好評をいただいています"}

■ こんな会社に向いています
・${industry}で管理業務に時間がかかっている
・ITが得意でないが、効率化したい
・まず試してみて、効果が出たら続けたい

■ 導入の流れ
ヒアリング（1〜2h） → MVP構築（3〜5日） → 試験運用（2〜4週間） → 効果確認

■ 費用
初期費用0円 / 月額${p.price_estimate || "5,000〜20,000円"}（相談可）`;

  const oneLiner = `${industry}の${workflow}で${effect}を達成した実績があります。導入費用0円、最短1週間で始められます。`;

  return { referral, firstContact, lpShort, threeMinSummary, oneLiner };
}
