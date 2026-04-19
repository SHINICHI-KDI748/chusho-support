// Problem.jsx — 課題提起セクション
// 差し替えポイント: PROBLEMS 配列（課題の項目・説明文）

const PROBLEMS = [
  {
    num: "01",
    title: "出退勤の記録が、紙と記憶に頼っている",
    body: "手書きの出勤簿、口頭での報告、Excelへの手入力。月末になって「記録が合わない」と気づいても、確認する術がない。",
  },
  {
    num: "02",
    title: "月末集計に、毎月同じ手間がかかっている",
    body: "誰かが紙を集め、Excelに転記して合計を出す。この作業が毎月繰り返され、ミスの温床にもなっている。",
  },
  {
    num: "03",
    title: "管理のやり方が、担当者に依存している",
    body: "「あの人がいないと分からない」状態は、いざというときに現場を止めるリスクになる。属人化は静かに積み重なる。",
  },
  {
    num: "04",
    title: "大きなシステムを入れるほどではないが、今のままでは厳しい",
    body: "勤怠管理専用パッケージの月額費用や導入コストは、規模の小さい現場には見合わないことが多い。でも、何かしなければいけない。",
  },
];

export default function Problem() {
  return (
    <section
      id="problem"
      style={{
        background: "#0f0f0f",
        color: "#fafafa",
        padding: "120px 40px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 72,
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8a8a8a",
            }}
          >
            Problems
          </span>
          <div style={{ flex: 1, height: "0.5px", background: "#3a3a3a" }} />
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 72 }}>
          <h2
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(22px, 2.8vw, 34px)",
              fontWeight: 400,
              lineHeight: 1.65,
              letterSpacing: "0.04em",
              color: "#fafafa",
              maxWidth: 560,
            }}
          >
            こんな状況が、<br />
            月末のたびに繰り返されていませんか。
          </h2>
        </div>

        {/* Problems grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0",
            borderTop: "0.5px solid #2a2a2a",
            borderLeft: "0.5px solid #2a2a2a",
          }}
        >
          {PROBLEMS.map((problem, i) => (
            <div
              key={i}
              style={{
                padding: "48px 48px 48px 48px",
                borderRight: "0.5px solid #2a2a2a",
                borderBottom: "0.5px solid #2a2a2a",
                position: "relative",
              }}
            >
              {/* Number */}
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: "#3a3a3a",
                  marginBottom: 24,
                }}
              >
                {problem.num}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: 1.7,
                  letterSpacing: "0.04em",
                  color: "#fafafa",
                  marginBottom: 16,
                }}
              >
                {problem.title}
              </h3>

              {/* Body */}
              <p
                style={{
                  fontSize: 13.5,
                  color: "#8a8a8a",
                  lineHeight: 1.9,
                  letterSpacing: "0.03em",
                }}
              >
                {problem.body}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div
          style={{
            marginTop: 72,
            padding: "36px 48px",
            border: "0.5px solid #2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 400,
              lineHeight: 1.7,
              letterSpacing: "0.04em",
              color: "#e8e6e3",
            }}
          >
            どれも「特別な問題」ではありません。<br />
            ただ、そのままにしておくのは、もったいない。
          </p>
          <a
            href="#contact"
            className="btn-outline"
            style={{
              borderColor: "#3a3a3a",
              color: "#c4c2be",
              whiteSpace: "nowrap",
              transition: "border-color 0.22s, color 0.22s, background 0.22s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fafafa";
              e.currentTarget.style.color = "#0f0f0f";
              e.currentTarget.style.borderColor = "#fafafa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#c4c2be";
              e.currentTarget.style.borderColor = "#3a3a3a";
            }}
          >
            まず話を聞いてみる
          </a>
        </div>
      </div>
    </section>
  );
}
