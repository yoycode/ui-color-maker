'use client';

import type { Palette, PaletteColor } from '@/features/palette/types';

type MockupPreviewProps = {
  palette: Palette;
  isDark?: boolean;
};

// Returns hex for a given role, falling back to first color
function getColor(palette: Palette, role: PaletteColor['role']): string {
  const found = palette.colors.find((c) => c.role === role);
  return found ? found.hex : palette.colors[0]?.hex ?? '#000000';
}

// Convert hex to an approximate luminance (0=dark, 1=bright)
function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Hex with alpha — returns rgba string
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Pick best contrasting bg/fg pair given all palette hex values
function pickContrastingPair(colors: PaletteColor[]): { bg: string; fg: string } {
  const sorted = [...colors].sort(
    (a, b) => hexLuminance(a.hex) - hexLuminance(b.hex),
  );
  const darkest = sorted[0]?.hex ?? '#111111';
  const lightest = sorted[sorted.length - 1]?.hex ?? '#ffffff';
  return { bg: darkest, fg: lightest };
}

export default function MockupPreview({ palette, isDark = false }: MockupPreviewProps) {
  const bgColor = getColor(palette, 'background');
  const surfaceColor = getColor(palette, 'surface');
  const primaryColor = getColor(palette, 'primary');
  const accentColor = getColor(palette, 'accent');
  const textColor = getColor(palette, 'text');

  // Dark mode: invert bg/text roles using luminance-based logic
  let pageBg: string;
  let pageText: string;
  let cardBg: string;

  if (isDark) {
    const pair = pickContrastingPair(palette.colors);
    pageBg = pair.bg;
    pageText = pair.fg;
    // Card slightly lighter than page bg
    const bgLum = hexLuminance(pair.bg);
    cardBg = bgLum < 0.3 ? hexAlpha(surfaceColor, 0.15) : surfaceColor;
  } else {
    pageBg = bgColor;
    pageText = textColor;
    cardBg = surfaceColor;
  }

  const navBg = isDark ? hexAlpha(pageBg, 0.95) : hexAlpha(bgColor, 0.95);
  const borderColor = hexAlpha(primaryColor, 0.25);
  const accentSubtle = hexAlpha(accentColor, 0.12);

  const cards = [
    {
      seed: `${palette.id}-0`,
      title: '빛과 그림자',
      subtitle: '자연의 결이 담긴 공간',
      tag: '에디토리얼',
    },
    {
      seed: `${palette.id}-1`,
      title: '침묵의 언어',
      subtitle: '고요 속에 피어난 형태들',
      tag: '컬렉션',
    },
    {
      seed: `${palette.id}-2`,
      title: '계절의 경계',
      subtitle: '변화와 지속 사이의 풍경',
      tag: '인터뷰',
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif",
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        boxShadow: `0 8px 40px ${hexAlpha(textColor, 0.12)}, 0 2px 8px ${hexAlpha(textColor, 0.06)}`,
        background: pageBg,
        userSelect: 'none',
      }}
      aria-label="시안 미리보기"
    >
      {/* Browser chrome bar */}
      <div
        style={{
          background: isDark ? hexAlpha(primaryColor, 0.08) : hexAlpha(surfaceColor, 0.9),
          borderBottom: `1px solid ${borderColor}`,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Traffic dots */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#ff5f57',
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#febc2e',
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#28c840',
            }}
          />
        </div>

        {/* Address bar */}
        <div
          style={{
            flex: 1,
            background: isDark ? hexAlpha(pageText, 0.06) : hexAlpha(textColor, 0.06),
            border: `1px solid ${borderColor}`,
            borderRadius: '6px',
            padding: '3px 10px',
            fontSize: '11px',
            color: hexAlpha(pageText, 0.5),
            letterSpacing: '0.01em',
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
          }}
        >
          your-brand.com
        </div>
      </div>

      {/* Actual page content */}
      <div
        style={{
          background: pageBg,
          color: pageText,
          overflowY: 'auto',
          maxHeight: '640px',
        }}
      >
        {/* Navigation */}
        <nav
          style={{
            background: navBg,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${borderColor}`,
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '56px',
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: pageText,
              }}
            >
              ÉDITION
            </span>
            <span
              style={{
                fontSize: '11px',
                color: accentColor,
                letterSpacing: '0.12em',
                fontStyle: 'italic',
                fontFamily: "'Georgia', serif",
              }}
            >
              studio
            </span>
          </div>

          {/* Nav items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {['컬렉션', '에디토리얼', '아카이브', '어바웃'].map((item) => (
              <span
                key={item}
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  color: hexAlpha(pageText, 0.65),
                  cursor: 'default',
                }}
              >
                {item}
              </span>
            ))}

            {/* CTA button */}
            <span
              style={{
                background: primaryColor,
                color: hexLuminance(primaryColor) > 0.4 ? '#111111' : '#ffffff',
                padding: '7px 16px',
                fontSize: '11px',
                letterSpacing: '0.1em',
                borderRadius: '3px',
                cursor: 'default',
                fontWeight: 600,
              }}
            >
              구독하기
            </span>
          </div>
        </nav>

        {/* Hero Section */}
        <section
          style={{
            padding: '72px 32px 60px',
            borderBottom: `1px solid ${borderColor}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative accent stripe */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '3px',
              height: '100%',
              background: `linear-gradient(to bottom, ${accentColor}, ${hexAlpha(accentColor, 0)})`,
            }}
          />

          {/* Issue label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '1px',
                background: accentColor,
              }}
            />
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                color: accentColor,
                fontFamily: "'Georgia', serif",
                fontStyle: 'italic',
              }}
            >
              ISSUE NO. 08 — 2024 AUTUMN
            </span>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontSize: '48px',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              fontWeight: 700,
              color: pageText,
              maxWidth: '560px',
              marginBottom: '20px',
              fontFamily: "'Georgia', 'Palatino Linotype', serif",
            }}
          >
            조용한 풍경,
            <br />
            <em style={{ fontStyle: 'italic', color: hexAlpha(pageText, 0.75) }}>
              깊은 색의
            </em>{' '}
            이야기
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              color: hexAlpha(pageText, 0.6),
              maxWidth: '400px',
              marginBottom: '40px',
              fontFamily: "'Georgia', serif",
            }}
          >
            색은 단순한 시각적 자극이 아닙니다. 감정의 온도이고,
            기억의 질감이며, 조용히 말을 거는 언어입니다.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span
              style={{
                background: primaryColor,
                color: hexLuminance(primaryColor) > 0.4 ? '#111111' : '#ffffff',
                padding: '12px 28px',
                fontSize: '12px',
                letterSpacing: '0.1em',
                borderRadius: '3px',
                cursor: 'default',
                fontWeight: 700,
              }}
            >
              이야기 읽기
            </span>
            <span
              style={{
                border: `1.5px solid ${hexAlpha(pageText, 0.3)}`,
                color: pageText,
                padding: '11px 28px',
                fontSize: '12px',
                letterSpacing: '0.1em',
                borderRadius: '3px',
                cursor: 'default',
              }}
            >
              컬렉션 보기
            </span>
          </div>

          {/* Decorative background numeral */}
          <div
            style={{
              position: 'absolute',
              right: '28px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '180px',
              fontWeight: 900,
              color: hexAlpha(primaryColor, 0.05),
              letterSpacing: '-0.06em',
              lineHeight: 1,
              fontFamily: "'Georgia', serif",
              pointerEvents: 'none',
            }}
          >
            08
          </div>
        </section>

        {/* Featured Cards Grid */}
        <section style={{ padding: '48px 32px' }}>
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  color: hexAlpha(pageText, 0.4),
                  fontFamily: "'Georgia', serif",
                }}
              >
                FEATURED
              </span>
              <div
                style={{
                  height: '1px',
                  width: '40px',
                  background: borderColor,
                }}
              />
            </div>
            <span
              style={{
                fontSize: '11px',
                color: accentColor,
                letterSpacing: '0.05em',
                cursor: 'default',
                borderBottom: `1px solid ${accentColor}`,
                paddingBottom: '1px',
              }}
            >
              모두 보기 →
            </span>
          </div>

          {/* 3-column grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
            }}
          >
            {cards.map((card, i) => (
              <article
                key={card.seed}
                style={{
                  background: isDark
                    ? hexAlpha(pageText, 0.04)
                    : cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'default',
                }}
              >
                {/* Card image */}
                <div
                  style={{
                    position: 'relative',
                    height: '160px',
                    overflow: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/${card.seed}/600/400`}
                    alt={card.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {/* Tag badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: accentColor,
                      color: hexLuminance(accentColor) > 0.4 ? '#111111' : '#ffffff',
                      padding: '3px 8px',
                      fontSize: '9px',
                      letterSpacing: '0.12em',
                      borderRadius: '2px',
                      fontWeight: 700,
                    }}
                  >
                    {card.tag}
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      color: hexAlpha(pageText, 0.35),
                      marginBottom: '6px',
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    0{i + 1}
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: pageText,
                      marginBottom: '4px',
                      lineHeight: 1.2,
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '11px',
                      color: hexAlpha(pageText, 0.5),
                      lineHeight: 1.5,
                      marginBottom: '14px',
                    }}
                  >
                    {card.subtitle}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '1px',
                        background: primaryColor,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '10px',
                        color: accentColor,
                        letterSpacing: '0.05em',
                      }}
                    >
                      읽기
                    </span>
                  </div>
                </div>

                {/* Accent bottom border on hover feel */}
                <div
                  style={{
                    height: '2px',
                    background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                  }}
                />
              </article>
            ))}
          </div>
        </section>

        {/* Divider with accent dot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            gap: '12px',
          }}
        >
          <div
            style={{ flex: 1, height: '1px', background: borderColor }}
          />
          <div
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: accentColor,
            }}
          />
          <div
            style={{ flex: 1, height: '1px', background: borderColor }}
          />
        </div>

        {/* Newsletter Banner */}
        <section
          style={{
            margin: '0 32px',
            marginTop: '32px',
            marginBottom: '0',
            background: accentSubtle,
            border: `1px solid ${hexAlpha(accentColor, 0.2)}`,
            borderRadius: '4px',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: pageText,
                marginBottom: '4px',
                fontFamily: "'Georgia', serif",
              }}
            >
              뉴스레터 구독
            </p>
            <p
              style={{
                fontSize: '11px',
                color: hexAlpha(pageText, 0.55),
                lineHeight: 1.5,
              }}
            >
              매 계절, 선별된 이야기를 메일로 전달합니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <span
              style={{
                border: `1px solid ${hexAlpha(pageText, 0.2)}`,
                borderRadius: '3px',
                padding: '8px 14px',
                fontSize: '11px',
                color: hexAlpha(pageText, 0.4),
                background: isDark ? hexAlpha(pageText, 0.04) : hexAlpha(bgColor, 0.7),
                minWidth: '120px',
              }}
            >
              이메일 주소
            </span>
            <span
              style={{
                background: primaryColor,
                color: hexLuminance(primaryColor) > 0.4 ? '#111111' : '#ffffff',
                padding: '8px 16px',
                fontSize: '11px',
                letterSpacing: '0.08em',
                borderRadius: '3px',
                cursor: 'default',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              구독하기
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: `1px solid ${borderColor}`,
            marginTop: '48px',
            padding: '40px 32px 28px',
            background: isDark
              ? hexAlpha(pageText, 0.03)
              : hexAlpha(surfaceColor, 0.5),
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '32px',
              marginBottom: '32px',
            }}
          >
            {/* Brand column */}
            <div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: pageText,
                  marginBottom: '4px',
                  fontFamily: "'Georgia', serif",
                }}
              >
                ÉDITION
              </div>
              <div
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: accentColor,
                  fontStyle: 'italic',
                  fontFamily: "'Georgia', serif",
                  marginBottom: '14px',
                }}
              >
                studio
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: hexAlpha(pageText, 0.45),
                  lineHeight: 1.7,
                  maxWidth: '240px',
                }}
              >
                색과 형태가 만나는 자리,
                <br />
                감각으로 편집된 비주얼 아카이브.
              </p>
            </div>

            {/* Links column 1 */}
            <div>
              <p
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  color: hexAlpha(pageText, 0.35),
                  marginBottom: '14px',
                }}
              >
                EXPLORE
              </p>
              {['컬렉션', '에디토리얼', '아카이브', '아티스트'].map((link) => (
                <div
                  key={link}
                  style={{
                    fontSize: '12px',
                    color: hexAlpha(pageText, 0.55),
                    marginBottom: '8px',
                    cursor: 'default',
                  }}
                >
                  {link}
                </div>
              ))}
            </div>

            {/* Links column 2 */}
            <div>
              <p
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  color: hexAlpha(pageText, 0.35),
                  marginBottom: '14px',
                }}
              >
                CONNECT
              </p>
              {['인스타그램', '뉴스레터', '문의하기', '파트너십'].map((link) => (
                <div
                  key={link}
                  style={{
                    fontSize: '12px',
                    color: hexAlpha(pageText, 0.55),
                    marginBottom: '8px',
                    cursor: 'default',
                  }}
                >
                  {link}
                </div>
              ))}
            </div>
          </div>

          {/* Footer bottom */}
          <div
            style={{
              borderTop: `1px solid ${borderColor}`,
              paddingTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: hexAlpha(pageText, 0.3),
                letterSpacing: '0.05em',
              }}
            >
              © 2024 ÉDITION Studio. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['개인정보처리방침', '이용약관'].map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: '10px',
                    color: hexAlpha(pageText, 0.3),
                    letterSpacing: '0.03em',
                    cursor: 'default',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
