// FAQ.jsx — よくある質問セクション
// 差し替えポイント: FAQS 配列（質問・回答）

import { useState } from "react";

const FAQS = [
  {
    q: "どのくらいの規模の工場向けですか？",
    a: "従業員5名〜20名程度の町工場・小規模工場を対象としています。それ以上の規模になると、市販の勤怠管理パッケージをご検討されることもありますが、まずはご相談ください。現状に合った形をご提案します。",
  },
  {
    q: "今Excelで管理していますが、移行できますか？",
    a: "はい、対応しています。現在お使いのExcelの項目や運用フローを確認したうえで、できる限り既存のやり方に合わせた形で整備します。一から作り直しではなく、「今の運用を整える」イメージです。",
  },
  {
    q: "スマホは必要ですか？",
    a: "基本的に、パソコン（またはタブレット）があれば対応できます。スマホからの入力が必要な場合は、対応可否をヒアリング時にご確認します。",
  },
  {
    q: "導入までどのくらいかかりますか？",
    a: "ご相談からヒアリング・提案を経て、通常4〜8週間程度で稼働できます。現場の状況や必要な機能の範囲によって変わりますので、ご相談時にお伝えします。",
  },
  {
    q: "まず相談だけでもよいですか？",
    a: "もちろんです。「うちの規模で使えるか分からない」「何から整えればいいか分からない」という段階でも構いません。初回のご相談は無料です。導入しないという判断になっても問題ありません。",
  },
  {
    q: "既存のシステム（給与計算ソフト等）と連携できますか？",
    a: "CSV形式での出力に対応しているため、多くの給与計算ソフトへの連携が可能です。ご使用中のソフトをヒアリング時にお知らせください。",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section
      id="faq"
      style={{
        background: "#fafafa",
        padding: "120px 40px",
        borderTop: "0.5px solid #dddbd8",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 80,
            alignItems: "start",
          }}
        >
          {/* Left: label + heading */}
          <div style={{ position: "sticky", top: 100 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#8a8a8a",
                marginBottom: 24,
              }}
            >
              FAQ
            </div>
            <h2
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "clamp(20px, 2.4vw, 30px)",
                fontWeight: 400,
                lineHeight: 1.65,
                letterSpacing: "0.04em",
                color: "#0f0f0f",
                marginBottom: 32,
              }}
            >
              よくある<br />
              ご質問
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: "#8a8a8a",
                lineHeight: 1.8,
                letterSpacing: "0.03em",
              }}
            >
              その他のご質問は、<br />
              お気軽にお問い合わせください。
            </p>
          </div>

          {/* Right: accordion */}
          <div>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  borderTop: "0.5px solid #dddbd8",
                  ...(i === FAQS.length - 1 ? { borderBottom: "0.5px solid #dddbd8" } : {}),
                }}
              >
                {/* Question */}
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "28px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 24,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Noto Sans JP', sans-serif",
                      fontSize: 15,
                      fontWeight: 500,
                      letterSpacing: "0.03em",
                      color: "#0f0f0f",
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.q}
                  </span>
                  {/* Toggle icon */}
                  <span
                    style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      border: "0.5px solid #c4c2be",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s",
                      transform: open === i ? "rotate(45deg)" : "none",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <line x1="5" y1="0" x2="5" y2="10" stroke="#3a3a3a" strokeWidth="0.8" />
                      <line x1="0" y1="5" x2="10" y2="5" stroke="#3a3a3a" strokeWidth="0.8" />
                    </svg>
                  </span>
                </button>

                {/* Answer */}
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: open === i ? 400 : 0,
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      color: "#3a3a3a",
                      lineHeight: 1.9,
                      letterSpacing: "0.03em",
                      paddingBottom: 28,
                      paddingLeft: 0,
                      borderLeft: "2px solid #dddbd8",
                      paddingLeft: 20,
                      marginLeft: 0,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
