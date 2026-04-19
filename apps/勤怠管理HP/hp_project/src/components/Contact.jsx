// Contact.jsx — 最終CTA / お問い合わせセクション
// 差し替えポイント: FORM_URL（フォームURL）、CONTACT_EMAIL（メールアドレス）

// ── フォームURL: Google Forms、Typeform、Formrunなどに差し替え ──
const FORM_URL = "https://forms.example.com/contact"; // ← ここをフォームのURLに変更
const CONTACT_EMAIL = "info@example.com"; // ← メールアドレスに変更

export default function Contact() {
  return (
    <section
      id="contact"
      style={{
        background: "#0f0f0f",
        padding: "140px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background structure */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "33.33%",
          width: "0.5px",
          height: "100%",
          background: "#1c1c1c",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "66.66%",
          width: "0.5px",
          height: "100%",
          background: "#1c1c1c",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Label */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#3a3a3a",
            marginBottom: 56,
          }}
        >
          Free Consultation
        </div>

        {/* Main heading */}
        <div
          style={{
            maxWidth: 760,
            marginBottom: 64,
          }}
        >
          <h2
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(26px, 3.5vw, 48px)",
              fontWeight: 400,
              lineHeight: 1.55,
              letterSpacing: "0.04em",
              color: "#fafafa",
              marginBottom: 28,
            }}
          >
            「うちの規模でも使えるか」から、<br />
            確かめてみてください。
          </h2>

          {/* Hairline */}
          <div
            style={{
              width: 48,
              height: "0.5px",
              background: "#3a3a3a",
              marginBottom: 28,
            }}
          />

          <p
            style={{
              fontSize: 15,
              color: "#8a8a8a",
              lineHeight: 1.9,
              letterSpacing: "0.03em",
            }}
          >
            まずは現状をお聞かせください。導入できるかどうか、<br />
            どんな形が合うかを、無料でご確認いただけます。<br />
            お申し込みから導入まで、押し売りは一切しません。
          </p>
        </div>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            marginBottom: 80,
            flexWrap: "wrap",
          }}
        >
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#fafafa",
              color: "#0f0f0f",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13.5,
              fontWeight: 500,
              letterSpacing: "0.12em",
              padding: "18px 52px",
              border: "1px solid #fafafa",
              cursor: "pointer",
              textDecoration: "none",
              transition: "background 0.22s, color 0.22s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#fafafa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fafafa";
              e.currentTarget.style.color = "#0f0f0f";
            }}
          >
            初回無料相談を申し込む
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13,
              letterSpacing: "0.08em",
              color: "#8a8a8a",
              textDecoration: "none",
              transition: "color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c4c2be")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8a8a")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="0.5" y="2.5" width="13" height="9" rx="0.5" stroke="#8a8a8a" strokeWidth="0.8" />
              <path d="M0.5 3L7 8L13.5 3" stroke="#8a8a8a" strokeWidth="0.8" />
            </svg>
            メールで問い合わせる
          </a>
        </div>

        {/* Bottom info row */}
        <div
          style={{
            borderTop: "0.5px solid #1c1c1c",
            paddingTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
          }}
        >
          {[
            { label: "初回相談", value: "無料", note: "お申し込みから1週間以内にご連絡" },
            { label: "対応エリア", value: "全国対応", note: "オンラインヒアリング可" },
            { label: "導入期間の目安", value: "4〜8週間", note: "規模・内容により変動" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "0 40px",
                borderLeft: i === 0 ? "none" : "0.5px solid #1c1c1c",
                paddingLeft: i === 0 ? 0 : 40,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#3a3a3a",
                  marginBottom: 8,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: 18,
                  fontWeight: 400,
                  letterSpacing: "0.04em",
                  color: "#fafafa",
                  marginBottom: 6,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#3a3a3a",
                  letterSpacing: "0.04em",
                }}
              >
                {item.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
