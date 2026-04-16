'use client';

import React from 'react';
import { Search, X, Dot } from 'lucide-react';
import type { Palette } from '@/features/palette/types';

type ComponentsPreviewProps = {
  palette: Palette;
  isDark?: boolean;
};

/**
 * Calculate luminance of a hex color for auto-contrast text color selection
 * Uses relative luminance formula from WCAG
 */
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  // Convert to sRGB
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determine contrast text color (white or black) based on background luminance
 * threshold ~0.5 for optimal readability
 */
function getContrastTextColor(bgHex: string): string {
  const luminance = getLuminance(bgHex);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default function ComponentsPreview({
  palette,
  isDark = false,
}: ComponentsPreviewProps) {
  // Extract palette colors by role
  const paletteMap = Object.fromEntries(
    palette.colors.map((c) => [c.role, c.hex])
  );

  const colors = {
    background: isDark ? paletteMap.surface || '#1a1a1a' : paletteMap.background || '#ffffff',
    surface: isDark ? paletteMap.background || '#ffffff' : paletteMap.surface || '#f5f5f5',
    primary: paletteMap.primary || '#3b82f6',
    accent: paletteMap.accent || '#ec4899',
    text: isDark ? '#ffffff' : paletteMap.text || '#000000',
    textMuted: isDark ? '#a0a0a0' : '#666666',
    border: isDark ? '#333333' : '#e5e5e5',
  };

  // Get contrast text for primary and accent backgrounds
  const textOnPrimary = getContrastTextColor(colors.primary);
  const textOnAccent = getContrastTextColor(colors.accent);
  const textOnSurface = isDark ? '#ffffff' : colors.text;

  return (
    <div
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
      className="p-8 rounded-lg space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">UI Components Preview</h2>
        <p style={{ color: colors.textMuted }} className="text-sm">
          See how your palette colors apply to common interface elements
        </p>
      </div>

      {/* Grid: 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1: Buttons & Inputs */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Buttons & Inputs</h3>

          {/* Primary Button */}
          <div>
            <label style={{ color: colors.textMuted }} className="text-xs font-medium block mb-2">
              Primary Button
            </label>
            <button
              style={{
                backgroundColor: colors.primary,
                color: textOnPrimary,
                border: 'none',
              }}
              className="px-4 py-2 rounded font-medium cursor-pointer hover:opacity-90 transition-opacity"
            >
              Primary Action
            </button>
          </div>

          {/* Secondary Button */}
          <div>
            <label style={{ color: colors.textMuted }} className="text-xs font-medium block mb-2">
              Secondary Button
            </label>
            <button
              style={{
                backgroundColor: colors.surface,
                color: textOnSurface,
                border: `1px solid ${colors.border}`,
              }}
              className="px-4 py-2 rounded font-medium cursor-pointer hover:opacity-80 transition-opacity"
            >
              Secondary Action
            </button>
          </div>

          {/* Ghost Button */}
          <div>
            <label style={{ color: colors.textMuted }} className="text-xs font-medium block mb-2">
              Ghost Button
            </label>
            <button
              style={{
                backgroundColor: 'transparent',
                color: colors.accent,
                border: 'none',
              }}
              className="px-4 py-2 rounded font-medium cursor-pointer hover:opacity-70 transition-opacity"
            >
              Ghost Action
            </button>
          </div>

          {/* Disabled Button */}
          <div>
            <label style={{ color: colors.textMuted }} className="text-xs font-medium block mb-2">
              Disabled Button
            </label>
            <button
              disabled
              style={{
                backgroundColor: colors.text,
                color: colors.surface,
                opacity: 0.4,
                border: 'none',
              }}
              className="px-4 py-2 rounded font-medium cursor-not-allowed"
            >
              Disabled
            </button>
          </div>

          {/* Input Field */}
          <div>
            <label style={{ color: colors.textMuted }} className="text-xs font-medium block mb-2">
              Input Field
            </label>
            <input
              type="text"
              placeholder="Type something..."
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.accent,
                color: colors.text,
              }}
              className="w-full px-3 py-2 rounded border placeholder-gray-400"
            />
          </div>

          {/* Search Input */}
          <div>
            <label style={{ color: colors.textMuted }} className="text-xs font-medium block mb-2">
              Search Input
            </label>
            <div
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.accent,
              }}
              className="flex items-center border rounded px-3 py-2"
            >
              <Search
                size={18}
                style={{ color: colors.accent }}
                className="mr-2"
              />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  backgroundColor: 'transparent',
                  color: colors.text,
                }}
                className="flex-1 outline-none placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Column 2: Cards & Components */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Cards & Components</h3>

          {/* Stat Card */}
          <div
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="border rounded-lg p-4"
          >
            <div
              style={{ color: colors.textMuted }}
              className="text-xs font-medium uppercase tracking-wide mb-2"
            >
              Total Revenue
            </div>
            <div style={{ color: colors.primary }} className="text-3xl font-bold">
              $12,453
            </div>
            <div
              style={{ color: colors.textMuted }}
              className="text-xs mt-2"
            >
              +2.5% from last month
            </div>
          </div>

          {/* Notification Card */}
          <div
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="border rounded-lg p-4 flex items-start gap-3"
          >
            <Dot
              size={24}
              style={{ color: colors.accent }}
              className="flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div style={{ color: colors.text }} className="font-medium">
                업데이트 완료
              </div>
              <div
                style={{ color: colors.textMuted }}
                className="text-sm mt-1"
              >
                새로운 기능이 추가되었습니다
              </div>
            </div>
            <button
              style={{ color: colors.textMuted }}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X size={18} />
            </button>
          </div>

          {/* Badge Row */}
          <div>
            <label
              style={{ color: colors.textMuted }}
              className="text-xs font-medium block mb-3"
            >
              Badges / Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Primary Badge */}
              <span
                style={{
                  backgroundColor: colors.primary,
                  color: textOnPrimary,
                }}
                className="px-3 py-1 rounded-full text-xs font-medium"
              >
                Primary
              </span>

              {/* Accent Badge */}
              <span
                style={{
                  backgroundColor: colors.accent,
                  color: textOnAccent,
                }}
                className="px-3 py-1 rounded-full text-xs font-medium"
              >
                Accent
              </span>

              {/* Surface Badge */}
              <span
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: textOnSurface,
                }}
                className="px-3 py-1 rounded-full text-xs font-medium border"
              >
                Default
              </span>

              {/* Muted Badge */}
              <span
                style={{
                  backgroundColor: colors.border,
                  color: colors.textMuted,
                }}
                className="px-3 py-1 rounded-full text-xs font-medium"
              >
                Muted
              </span>
            </div>
          </div>

          {/* Color Swatch Info */}
          <div
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="border rounded-lg p-4"
          >
            <div
              style={{ color: colors.textMuted }}
              className="text-xs font-medium uppercase tracking-wide mb-3"
            >
              Palette Colors
            </div>
            <div className="space-y-2">
              {palette.colors.map((color) => (
                <div key={color.role} className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: color.hex }}
                    className="w-8 h-8 rounded border"
                  />
                  <div className="flex-1">
                    <div style={{ color: colors.text }} className="text-sm font-medium">
                      {color.name}
                    </div>
                    <div
                      style={{ color: colors.textMuted }}
                      className="text-xs"
                    >
                      {color.hex}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
