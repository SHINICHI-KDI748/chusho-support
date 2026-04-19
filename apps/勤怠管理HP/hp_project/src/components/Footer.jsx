// Footer.jsx
// 差し替えポイント: COMPANY_NAME, COMPANY_ADDRESS, PRIVACY_POLICY_URL

const COMPANY_NAME = "株式会社 ○○○○"; // ← 会社名に変更
const COMPANY_ADDRESS = "〒000-0000 ○○県○○市 ○○ 0-0-0"; // ← 住所に変更
const PRIVACY_POLICY_URL = "/privacy"; // ← プライバシーポリシーURLに変更
const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0f0f0f",
        borderTop: "0.5px solid #1c1c1c",
        padding: "48px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        {/* Left */}
        <div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 9,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#3a3a3a",
              marginBottom: 4,
            }}
          >
            Attendance Management System
          </div>
          <div
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 12,
              color: "#8a8a8a",
              letterSpacing: "0.04em",
            }}
          >
            {COMPANY_NAME}
          </div>
        </div>

        {/* Center */}
        <div
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 11.5,
            color: "#3a3a3a",
            letterSpacing: "0.04em",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          {COMPANY_ADDRESS}
        </div>

        {/* Right */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <a
            href={PRIVACY_POLICY_URL}
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 11,
              color: "#3a3a3a",
              textDecoration: "none",
              letterSpacing: "0.06em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#8a8a8a")}
            onMouseLeave={(e) => (e.target.style.color = "#3a3a3a")}
          >
            プライバシーポリシー
          </a>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 11,
              color: "#2a2a2a",
              letterSpacing: "0.08em",
            }}
          >
            © {YEAR} {COMPANY_NAME}
          </span>
        </div>
      </div>
    </footer>
  );
}
