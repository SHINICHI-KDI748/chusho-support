// Hero.jsx — ファーストビュー
// 差し替えポイント: HERO_MOCK_IMAGE（スクリーンショット画像のパス）

// ── UIモックの代替SVGコンポーネント（実際の画面に差し替える場合は下記を削除し <img> に変更）
// ── 差し替え方法: HERO_MOCK_IMAGE に画像パスを設定し、MockScreen を <img> に変更
const HERO_MOCK_IMAGE = null; // 例: "/images/mock-employee-input.png"

function MockScreen() {
  // 実際の画面スクリーンショットがある場合はこのコンポーネントを削除し、
  // <img src={HERO_MOCK_IMAGE} alt="勤怠入力画面" style={{ width: "100%" }} /> に差し替える
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #dddbd8",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(15,15,15,0.1), 0 4px 16px rgba(15,15,15,0.06)",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: "#f5f4f2",
          borderBottom: "0.5px solid #dddbd8",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e0dedd" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e0dedd" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e0dedd" }} />
        <div
          style={{
            marginLeft: 12,
            flex: 1,
            height: 20,
            background: "#ebe9e6",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 9, color: "#8a8a8a", letterSpacing: "0.05em" }}>
            勤怠入力システム — 従業員画面
          </span>
        </div>
      </div>

      {/* Screen body */}
      <div style={{ padding: "24px 28px", background: "#fafafa" }}>
        {/* Header bar */}
        <div
          style={{
            background: "#0f0f0f",
            color: "#fafafa",
            padding: "12px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, letterSpacing: "0.1em" }}>勤怠入力</span>
          <span style={{ fontSize: 11, color: "#8a8a8a", letterSpacing: "0.05em" }}>2025年12月</span>
        </div>

        {/* Employee info */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#8a8a8a", marginBottom: 4, letterSpacing: "0.06em" }}>
            従業員名
          </div>
          <div
            style={{
              border: "0.5px solid #dddbd8",
              padding: "8px 12px",
              fontSize: 12,
              color: "#1c1c1c",
              background: "#fff",
            }}
          >
            山田 太郎
          </div>
        </div>

        {/* Time inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: "#8a8a8a", marginBottom: 4, letterSpacing: "0.06em" }}>
              出勤時刻
            </div>
            <div
              style={{
                border: "0.5px solid #dddbd8",
                padding: "8px 12px",
                fontSize: 12,
                color: "#0f0f0f",
                background: "#fff",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 15,
                letterSpacing: "0.05em",
              }}
            >
              08:00
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#8a8a8a", marginBottom: 4, letterSpacing: "0.06em" }}>
              退勤時刻
            </div>
            <div
              style={{
                border: "0.5px solid #dddbd8",
                padding: "8px 12px",
                fontSize: 12,
                color: "#0f0f0f",
                background: "#fff",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 15,
                letterSpacing: "0.05em",
              }}
            >
              17:30
            </div>
          </div>
        </div>

        {/* Attendance rows */}
        <div style={{ borderTop: "0.5px solid #dddbd8" }}>
          {[
            { date: "12/02（月）", in: "08:02", out: "17:28", status: "正常" },
            { date: "12/03（火）", in: "08:15", out: "18:10", status: "正常" },
            { date: "12/04（水）", in: "07:55", out: "17:30", status: "正常" },
            { date: "12/05（木）", in: "—", out: "—", status: "未入力", alert: true },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "9px 4px",
                borderBottom: "0.5px solid #f0efed",
                fontSize: 11,
                color: row.alert ? "#8a4a4a" : "#3a3a3a",
                background: row.alert ? "#fdf5f5" : "transparent",
                alignItems: "center",
              }}
            >
              <span style={{ letterSpacing: "0.03em" }}>{row.date}</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, letterSpacing: "0.05em" }}>
                {row.in}
              </span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, letterSpacing: "0.05em" }}>
                {row.out}
              </span>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.06em",
                  color: row.alert ? "#8a4a4a" : "#8a8a8a",
                  textAlign: "right",
                }}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom label */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              background: "#0f0f0f",
              color: "#fafafa",
              fontSize: 10,
              letterSpacing: "0.1em",
              padding: "8px 24px",
            }}
          >
            入力を保存する
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 64,
        background: "#fafafa",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background structure line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: "0.5px",
          height: "100%",
          background: "#ebe9e6",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Left: Text */}
        <div>
          {/* Eyebrow */}
          <div className="eyebrow" style={{ marginBottom: 32 }}>
            Attendance Management System
          </div>

          {/* Main headline */}
          <h1
            className="section-heading"
            style={{
              fontSize: "clamp(30px, 3.5vw, 46px)",
              lineHeight: 1.55,
              marginBottom: 28,
              letterSpacing: "0.04em",
            }}
          >
            紙とExcelの<br />
            勤怠管理を、<br />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "0.85em",
                letterSpacing: "0.02em",
                color: "#3a3a3a",
              }}
            >
              パソコン1台
            </span>
            で整える。
          </h1>

          {/* Hairline */}
          <div
            style={{
              width: 40,
              height: "0.5px",
              background: "#c4c2be",
              marginBottom: 28,
            }}
          />

          {/* Sub copy */}
          <p
            style={{
              fontSize: 15,
              color: "#3a3a3a",
              lineHeight: 1.9,
              marginBottom: 16,
              letterSpacing: "0.03em",
            }}
          >
            従業員5〜20名の町工場・小規模工場向けに、<br />
            出退勤入力と月次集計の仕組みを、<br />
            現場の運用に合わせて丁寧に整えます。
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#8a8a8a",
              lineHeight: 1.8,
              marginBottom: 48,
              letterSpacing: "0.03em",
            }}
          >
            大がかりなシステムは必要ありません。<br />
            今ある環境で、小さく、確実に。
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href="#contact" className="btn-black">
              まず無料で相談する
            </a>
            <a href="#features" className="btn-outline">
              できることを見る
            </a>
          </div>

          {/* Trust note */}
          <p
            style={{
              marginTop: 24,
              fontSize: 11.5,
              color: "#8a8a8a",
              letterSpacing: "0.04em",
            }}
          >
            ※ 初回のご相談は無料です。導入のご判断は相談後に。
          </p>
        </div>

        {/* Right: Mock screen */}
        <div style={{ position: "relative" }}>
          {/* Frame decoration */}
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: "100%",
              height: "100%",
              border: "0.5px solid #dddbd8",
              pointerEvents: "none",
            }}
          />
          {HERO_MOCK_IMAGE ? (
            // ── 差し替え: 実際のスクリーンショットがある場合
            <img
              src={HERO_MOCK_IMAGE}
              alt="勤怠入力システム 従業員入力画面"
              style={{ width: "100%", display: "block" }}
            />
          ) : (
            <MockScreen />
          )}
        </div>
      </div>

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span className="eyebrow" style={{ fontSize: 9 }}>
          Scroll
        </span>
        <div style={{ width: "0.5px", height: 32, background: "#c4c2be" }} />
      </div>
    </section>
  );
}
