'use client';

import type { Palette } from '@/features/palette/types';

type TypographyPreviewProps = {
  palette: Palette;
  isDark?: boolean;
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

function getContrastingColor(
  bgHex: string,
  isDark: boolean
): string {
  const [r, g, b] = hexToRgb(bgHex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // If background is dark, use light text; if background is light, use dark text
  return luminance < 0.5 ? '#ffffff' : '#000000';
}

export default function TypographyPreview({
  palette,
  isDark = false,
}: TypographyPreviewProps) {
  // Find colors by role
  const backgroundColor = palette.colors.find((c) => c.role === 'background');
  const primaryColor = palette.colors.find((c) => c.role === 'primary');
  const accentColor = palette.colors.find((c) => c.role === 'accent');
  const textColor = palette.colors.find((c) => c.role === 'text');

  // Determine background and foreground colors
  const bgHex = isDark && textColor ? textColor.hex : backgroundColor?.hex || '#ffffff';
  const fgHex = getContrastingColor(bgHex, isDark);

  return (
    <div
      className="w-full p-12 md:p-16 lg:p-20"
      style={{
        backgroundColor: bgHex,
        color: fgHex,
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Eyebrow / Kicker */}
      <div
        className="text-sm font-sans tracking-widest uppercase mb-6"
        style={{ color: accentColor?.hex }}
      >
        Editorial · Issue 01
      </div>

      {/* Massive Headline */}
      <h1
        className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        style={{
          fontFamily: '"Georgia", "Noto Serif KR", serif',
          color: fgHex,
        }}
      >
        고요한 빛, 깊은 그림자
      </h1>

      {/* Subhead */}
      <p
        className="text-lg md:text-xl mb-8 max-w-2xl"
        style={{
          color: fgHex,
          opacity: 0.85,
        }}
      >
        시각적 계층과 색채의 조화로 이루어진 에디토리얼 타이포그래피의 완벽한 예시입니다.
      </p>

      {/* Body Paragraph */}
      <div className="space-y-4 mb-12 max-w-3xl">
        <p
          className="text-base md:text-lg leading-relaxed"
          style={{
            color: fgHex,
            opacity: 0.9,
          }}
        >
          디자인의 본질은 단순한 아름다움이 아니라 그것이 전달하는 감정과 의도에 있습니다.
          색상 팔레트의 각 색깔은 신중하게 선택되어, 브랜드의 정체성과 사용자 경험을 형성합니다.
          이러한 체계적인 접근은 모든 터치포인트에서 일관성을 보장합니다.
        </p>
        <p
          className="text-base md:text-lg leading-relaxed"
          style={{
            color: fgHex,
            opacity: 0.9,
          }}
        >
          타이포그래피는 단순한 글자가 아닙니다. 그것은 공간 안에서 음악을 연주하는 악보이며,
          시각적 계층을 통해 사용자의 시선을 인도합니다. 올바른 글꼴 선택과 크기 조정은
          읽기 경험을 개선하고 콘텐츠의 영향력을 증폭시킵니다.
        </p>
      </div>

      {/* Pull Quote */}
      <div
        className="pl-6 py-6 mb-12 border-l-4"
        style={{
          borderColor: accentColor?.hex,
        }}
      >
        <p
          className="text-lg md:text-xl italic max-w-2xl"
          style={{
            color: fgHex,
            fontStyle: 'italic',
          }}
        >
          &ldquo;색상과 글꼴의 조화는 브랜드 정체성을 만드는 첫 단계이며,
          이는 사용자와의 감정적 연결을 형성합니다.&rdquo;
        </p>
      </div>

      {/* Caption */}
      <div
        className="text-xs md:text-sm"
        style={{
          color: fgHex,
          opacity: 0.65,
        }}
      >
        Typography Sample · Palette by AI Color Generator · 2026
      </div>
    </div>
  );
}
