// Demo.jsx — デモ画面紹介セクション
// 差し替えポイント: DEMO_SCREENS 配列の imagePath（実際の画面スクリーンショットを差し込む）
// ── 差し替え方法: 各 imagePath に "/images/demo-xxx.png" のような実パスを設定する

const DEMO_SCREENS = [
  {
    id: "01",
    title: "従業員入力画面",
    desc: "シンプルな画面で、出退勤時刻を自分で入力。ITに不慣れなスタッフでも、迷わず使えるよう設計します。",
    imagePath: null, // ← 差し替え: "/images/demo-employee.png"
    mockLabel: "Employee Input",
    accent: "左: 日付・時刻入力 ／ 右: 入力履歴一覧",
  },
  {
    id: "02",
    title: "管理者 日次一覧",
    desc: "全員の当日・週間の勤怠状況を一覧で把握。未入力者・長時間者がひとめで分かります。",
    imagePath: null, // ← 差し替え: "/images/demo-admin-daily.png"
    mockLabel: "Admin Daily View",
    accent: "全員分のステータスを色別に表示",
  },
  {
    id: "03",
    title: "月次集計画面",
    desc: "月末に手作業で集計する必要がなくなります。各人の勤務時間・残業時間・有給日数が自動で算出されます。",
    imagePath: null, // ← 差し替え: "/images/demo-monthly.png"
    mockLabel: "Monthly Summary",
    accent: "CSV出力ボタンから給与計算ソフトへ連携",
  },
  {
    id: "04",
    title: "打刻漏れ・異常値一覧",
    desc: "未入力日・深夜打刻・退勤のみ打刻などを自動検知して一覧表示。月末前に確認・修正できます。",
    imagePath: null, // ← 差し替え: "/images/demo-alert.png"
    mockLabel: "Alert List",
    accent: "検知された記録を優先度順に表示",
  },
];

function MockScreenPlaceholder({ label, id }) {
  // 実画像に差し替える際は、このコンポーネントを削除して <img> を使用
  return (
    <div
      style={{
        background: "#f5f4f2",
        border: "0.5px solid #dddbd8",
        width: "100%",
        aspectRatio: "16/10",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#dddbd8 0.5px, transparent 0.5px), linear-gradient(90deg, #dddbd8 0.5px, transparent 0.5px)",
          backgroundSize: "40px 40px",
          opacity: 0.3,
        }}
      />

      {/* Mock content */}
      <div style={{ position: "relative", textAlign: "center" }}>
        {/* Fake header bar */}
        <div
          style={{
            background: "#0f0f0f",
            padding: "8px 24px",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#8a8a8a",
            }}
          >
            {label}
          </span>
        </div>

        {/* Mock rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 280 }}>
          {[90, 70, 80, 60, 75].map((w, i) => (
            <div
              key={i}
              style={{
                height: 10,
                background: "#dddbd8",
                width: `${w}%`,
                margin: "0 auto",
              }}
            />
          ))}
        </div>

        {/* Screen label */}
        <div
          style={{
            marginTop: 24,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "#c4c2be",
            textTransform: "uppercase",
          }}
        >
          Screen {id} — Replace with screenshot
        </div>
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <section
      id="demo"
      style={{
        background: "#f5f4f2",
        padding: "120px 40px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ marginBottom: 80 }}>
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
            System Preview
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "end",
            }}
          >
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
              実際の画面を、<br />
              ご覧ください。
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#3a3a3a",
                lineHeight: 1.9,
                letterSpacing: "0.03em",
              }}
            >
              複雑な操作は一切ありません。<br />
              現場の方がすぐに使える画面設計を心がけています。<br />
              導入前にデモ画面を実際にお試しいただけます。
            </p>
          </div>
        </div>

        {/* Demo screens */}
        <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
          {DEMO_SCREENS.map((screen, i) => (
            <div
              key={screen.id}
              style={{
                display: "grid",
                gridTemplateColumns: i % 2 === 0 ? "1fr 1.6fr" : "1.6fr 1fr",
                gap: 64,
                alignItems: "center",
              }}
            >
              {/* Text side */}
              {i % 2 === 0 ? (
                <>
                  <ScreenInfo screen={screen} />
                  <ScreenImage screen={screen} />
                </>
              ) : (
                <>
                  <ScreenImage screen={screen} />
                  <ScreenInfo screen={screen} align="left" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScreenInfo({ screen, align = "left" }) {
  return (
    <div style={{ textAlign: align }}>
      {/* Number */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 72,
          letterSpacing: "-0.03em",
          color: "#e0dedd",
          lineHeight: 0.9,
          marginBottom: 16,
        }}
      >
        {screen.id}
      </div>

      <h3
        style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 20,
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: "0.04em",
          color: "#0f0f0f",
          marginBottom: 16,
        }}
      >
        {screen.title}
      </h3>

      {/* Hairline */}
      <div
        style={{
          width: 32,
          height: "0.5px",
          background: "#c4c2be",
          marginBottom: 20,
          marginLeft: align === "left" ? 0 : "auto",
          marginRight: align === "left" ? "auto" : 0,
        }}
      />

      <p
        style={{
          fontSize: 14,
          color: "#3a3a3a",
          lineHeight: 1.9,
          letterSpacing: "0.03em",
          marginBottom: 20,
        }}
      >
        {screen.desc}
      </p>

      <div
        style={{
          fontSize: 11.5,
          color: "#8a8a8a",
          letterSpacing: "0.06em",
          fontStyle: "italic",
        }}
      >
        {screen.accent}
      </div>
    </div>
  );
}

function ScreenImage({ screen }) {
  return (
    <div style={{ position: "relative" }}>
      {screen.imagePath ? (
        <img
          src={screen.imagePath}
          alt={screen.title}
          style={{
            width: "100%",
            display: "block",
            border: "0.5px solid #dddbd8",
          }}
        />
      ) : (
        <MockScreenPlaceholder label={screen.mockLabel} id={screen.id} />
      )}
    </div>
  );
}
