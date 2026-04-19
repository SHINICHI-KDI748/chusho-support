// Process.jsx — 導入の流れセクション
// 差し替えポイント: STEPS 配列（ステップの内容・説明）

const STEPS = [
  {
    num: "I",
    title: "ご相談の申込み",
    body: "フォームから、現在の勤怠管理の状況をお聞かせください。対応可能か、どんな形が合うかを確認します。",
    note: "無料 / オンライン対応可",
  },
  {
    num: "II",
    title: "現状ヒアリング",
    body: "従業員数、使用機材（パソコン・タブレット）、現在の運用ルールをお聞きします。訪問またはオンラインで実施します。",
    note: "1回 60〜90分程度",
  },
  {
    num: "III",
    title: "導入内容の整理・ご提案",
    body: "ヒアリング内容をもとに、どの機能が必要か、費用感はどのくらいかをまとめてご提案します。無理な押し売りはしません。",
    note: "書類でご提示します",
  },
  {
    num: "IV",
    title: "初期設定・操作説明",
    body: "実際に画面を作り込み、従業員・管理者への操作説明を実施。稼働後の不明点にも対応します。",
    note: "導入完了まで伴走",
  },
];

export default function Process() {
  return (
    <section
      id="process"
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
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            marginBottom: 80,
            alignItems: "end",
          }}
        >
          <div>
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
              How it works
            </div>
            <h2
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "clamp(22px, 2.8vw, 34px)",
                fontWeight: 400,
                lineHeight: 1.6,
                letterSpacing: "0.04em",
                color: "#0f0f0f",
              }}
            >
              導入の流れ。<br />
              ご相談から稼働まで。
            </h2>
          </div>
          <div>
            <p
              style={{
                fontSize: 14.5,
                color: "#3a3a3a",
                lineHeight: 1.9,
                letterSpacing: "0.03em",
              }}
            >
              「まず話を聞いてほしい」から始めて構いません。<br />
              現状を整理したうえで、合う形をご提案します。<br />
              導入後もご不明点があればご連絡ください。
            </p>
          </div>
        </div>

        {/* Steps — horizontal timeline with vertical numbers */}
        <div style={{ position: "relative" }}>
          {/* Connecting line */}
          <div
            style={{
              position: "absolute",
              top: 28,
              left: 28,
              right: 28,
              height: "0.5px",
              background: "#dddbd8",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  padding: "0 32px 0 0",
                  position: "relative",
                }}
              >
                {/* Number dot + Roman numeral */}
                <div style={{ marginBottom: 28, position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      border: "0.5px solid #dddbd8",
                      background: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 18,
                        letterSpacing: "0.1em",
                        color: "#0f0f0f",
                        fontStyle: "italic",
                      }}
                    >
                      {step.num}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: 1.65,
                    letterSpacing: "0.04em",
                    color: "#0f0f0f",
                    marginBottom: 12,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "#3a3a3a",
                    lineHeight: 1.9,
                    letterSpacing: "0.03em",
                    marginBottom: 16,
                  }}
                >
                  {step.body}
                </p>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8a8a8a",
                    letterSpacing: "0.08em",
                    borderLeft: "1.5px solid #dddbd8",
                    paddingLeft: 10,
                  }}
                >
                  {step.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
