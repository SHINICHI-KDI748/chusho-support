// Pricing.jsx — 価格セクション
// 差し替えポイント: PRICE_MIN, PRICE_MAX（価格帯）、PRICE_NOTE（備考）

const PRICE_MIN = "100,000";
const PRICE_MAX = "200,000";
const PRICE_CURRENCY = "円";
const PRICE_NOTE = "初期導入費（税別）。従業員数・必要機能により変動します。";
const PRICE_ITEMS = [
  "出退勤入力画面の整備",
  "管理者確認一覧の整備",
  "月次集計の仕組み整理",
  "初期設定・データ設定",
  "従業員・管理者への操作説明",
  "稼働後のフォロー対応（1ヶ月）",
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        background: "#f5f4f2",
        padding: "120px 40px",
        borderTop: "0.5px solid #dddbd8",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section label */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#8a8a8a",
            marginBottom: 72,
          }}
        >
          Pricing
        </div>

        {/* Main layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
            border: "0.5px solid #dddbd8",
          }}
        >
          {/* Left: price display */}
          <div
            style={{
              padding: "64px 64px",
              borderRight: "0.5px solid #dddbd8",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: 14,
                fontWeight: 400,
                letterSpacing: "0.08em",
                color: "#3a3a3a",
                marginBottom: 24,
              }}
            >
              初期導入費
            </div>

            {/* Price */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 56,
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  color: "#0f0f0f",
                  lineHeight: 1,
                }}
              >
                {PRICE_MIN}
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  color: "#8a8a8a",
                }}
              >
                〜
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 56,
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  color: "#0f0f0f",
                  lineHeight: 1,
                }}
              >
                {PRICE_MAX}
              </span>
              <span
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 16,
                  color: "#3a3a3a",
                  marginLeft: 4,
                }}
              >
                {PRICE_CURRENCY}
              </span>
            </div>

            <p
              style={{
                fontSize: 12,
                color: "#8a8a8a",
                letterSpacing: "0.04em",
                marginBottom: 40,
                lineHeight: 1.7,
              }}
            >
              {PRICE_NOTE}
            </p>

            {/* Hairline */}
            <div style={{ height: "0.5px", background: "#dddbd8", marginBottom: 32 }} />

            <p
              style={{
                fontSize: 13.5,
                color: "#3a3a3a",
                lineHeight: 1.9,
                letterSpacing: "0.03em",
              }}
            >
              月額費用はかかりません。<br />
              現状の環境・規模に応じて個別にご調整します。<br />
              まずは無料相談でご確認ください。
            </p>

            <div style={{ marginTop: 40 }}>
              <a href="#contact" className="btn-black">
                無料で相談する
              </a>
            </div>
          </div>

          {/* Right: what's included */}
          <div
            style={{
              padding: "64px 64px",
              background: "#fafafa",
            }}
          >
            <div
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: 14,
                fontWeight: 400,
                letterSpacing: "0.08em",
                color: "#3a3a3a",
                marginBottom: 32,
              }}
            >
              初期導入に含まれるもの
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {PRICE_ITEMS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "18px 0",
                    borderBottom: i < PRICE_ITEMS.length - 1 ? "0.5px solid #e8e6e3" : "none",
                  }}
                >
                  {/* Check mark — subtle */}
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: "0.5px solid #c4c2be",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        background: "#0f0f0f",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#1c1c1c",
                      letterSpacing: "0.03em",
                      lineHeight: 1.6,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 32,
                padding: "20px 20px",
                background: "#f5f4f2",
                border: "0.5px solid #e8e6e3",
              }}
            >
              <p
                style={{
                  fontSize: 12.5,
                  color: "#8a8a8a",
                  lineHeight: 1.8,
                  letterSpacing: "0.03em",
                }}
              >
                ※ 月額の維持費用なし。既存環境（Windows PC等）を活用するため、<br />
                新たな機器購入も基本的に不要です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
