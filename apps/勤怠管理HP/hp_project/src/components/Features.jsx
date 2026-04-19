// Features.jsx — できることセクション
// 差し替えポイント: FEATURES 配列（機能の項目・詳細）

const FEATURES = [
  {
    id: "A",
    title: "従業員が、自分で入力できる",
    detail: "出退勤時刻をパソコン上で入力。紙への手書きも、口頭報告も不要になります。シンプルな画面で、ITに不慣れな方でも迷いません。",
    tags: ["出退勤入力", "日報対応", "修正申請"],
  },
  {
    id: "B",
    title: "管理者が、一覧で確認できる",
    detail: "全員の勤怠状況を日次・月次で一覧表示。誰が未入力か、残業が多い日はどこかを、画面上で把握できます。",
    tags: ["日次一覧", "未入力検出", "管理者専用画面"],
  },
  {
    id: "C",
    title: "月次集計が、自動で出る",
    detail: "月末に入力データをもとに集計を自動算出。手作業の転記・合計計算から解放されます。",
    tags: ["月次集計", "残業時間", "有給管理"],
  },
  {
    id: "D",
    title: "打刻漏れ・異常値が、すぐ分かる",
    detail: "未入力の日、異常な時刻（例：深夜打刻、退勤のみ）を自動で検知して一覧表示。月末になってから気づくミスを減らします。",
    tags: ["漏れ検知", "異常値検出", "アラート"],
  },
  {
    id: "E",
    title: "CSVで、給与計算につながる",
    detail: "月次データをCSV形式で出力できます。既存の給与計算ソフトや経理との連携もスムーズです。",
    tags: ["CSV出力", "給与計算連携", "Excel対応"],
  },
];

export default function Features() {
  return (
    <section
      id="features"
      style={{
        background: "#fafafa",
        padding: "120px 40px",
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
              What you can do
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
              入力・確認・集計を、<br />
              ひとつの仕組みに整える。
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
              このシステムでできることは、シンプルです。<br />
              「現場の人が入力し、管理者が確認し、月末に集計できる」——<br />
              それだけを、確実に動くように整えます。
            </p>
          </div>
        </div>

        {/* Features layout: Stefan Cooke-inspired structure */}
        {/* Top row: A + B side by side */}
        <div
          style={{
            borderTop: "0.5px solid #dddbd8",
            borderLeft: "0.5px solid #dddbd8",
          }}
        >
          {/* Row 1: A + B */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {FEATURES.slice(0, 2).map((f) => (
              <FeatureCell key={f.id} feature={f} />
            ))}
          </div>

          {/* Row 2: C + D */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {FEATURES.slice(2, 4).map((f) => (
              <FeatureCell key={f.id} feature={f} />
            ))}
          </div>

          {/* Row 3: E — full width accent */}
          <div
            style={{
              borderRight: "0.5px solid #dddbd8",
              borderBottom: "0.5px solid #dddbd8",
              padding: "48px 56px",
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 48,
                  letterSpacing: "-0.02em",
                  color: "#e8e6e3",
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {FEATURES[4].id}
              </div>
              <h3
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: 17,
                  fontWeight: 400,
                  lineHeight: 1.65,
                  letterSpacing: "0.04em",
                  color: "#0f0f0f",
                }}
              >
                {FEATURES[4].title}
              </h3>
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  color: "#3a3a3a",
                  lineHeight: 1.9,
                  letterSpacing: "0.03em",
                  marginBottom: 20,
                }}
              >
                {FEATURES[4].detail}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {FEATURES[4].tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      border: "0.5px solid #c4c2be",
                      padding: "4px 12px",
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      color: "#8a8a8a",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCell({ feature }) {
  return (
    <div
      style={{
        padding: "48px 56px",
        borderRight: "0.5px solid #dddbd8",
        borderBottom: "0.5px solid #dddbd8",
      }}
    >
      {/* Large letter */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 48,
          letterSpacing: "-0.02em",
          color: "#e8e6e3",
          lineHeight: 1,
          marginBottom: 20,
        }}
      >
        {feature.id}
      </div>

      <h3
        style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 17,
          fontWeight: 400,
          lineHeight: 1.65,
          letterSpacing: "0.04em",
          color: "#0f0f0f",
          marginBottom: 14,
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontSize: 13.5,
          color: "#3a3a3a",
          lineHeight: 1.9,
          letterSpacing: "0.03em",
          marginBottom: 20,
        }}
      >
        {feature.detail}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {feature.tags.map((tag) => (
          <span
            key={tag}
            style={{
              border: "0.5px solid #c4c2be",
              padding: "4px 12px",
              fontSize: 11,
              letterSpacing: "0.06em",
              color: "#8a8a8a",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
