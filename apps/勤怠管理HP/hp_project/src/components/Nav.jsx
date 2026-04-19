// Nav.jsx — Top navigation bar
// 差し替えポイント: COMPANY_NAME（会社名）、NAV_LINKS（メニュー項目）
const COMPANY_NAME = "株式会社 ○○○○"; // ← 会社名を変更
const NAV_LINKS = [
  { label: "できること", href: "#features" },
  { label: "デモ画面", href: "#demo" },
  { label: "価格", href: "#pricing" },
  { label: "よくある質問", href: "#faq" },
];

export default function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(250,250,250,0.96)",
        backdropFilter: "blur(8px)",
        borderBottom: "0.5px solid #dddbd8",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo / Company name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8a8a8a",
            }}
          >
            Attendance System
          </span>
          <span
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "#0f0f0f",
            }}
          >
            {COMPANY_NAME}
          </span>
        </div>

        {/* Nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", gap: 32 }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 12.5,
                  letterSpacing: "0.06em",
                  color: "#3a3a3a",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#0f0f0f")}
                onMouseLeave={(e) => (e.target.style.color = "#3a3a3a")}
              >
                {link.label}
              </a>
            ))}
          </div>
          {/* CTA */}
          <a
            href="#contact"
            className="btn-black"
            style={{ padding: "10px 24px", fontSize: 12.5 }}
          >
            無料相談する
          </a>
        </div>
      </div>
    </nav>
  );
}
