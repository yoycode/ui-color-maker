'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { PaletteColor } from '@/features/palette/types';

// ─── Types ──────────────────────────────────────────────────────────────────

type ColorChipProps = {
  color: PaletteColor;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  showMeta?: boolean;
};

// ─── Role label map (Korean) ─────────────────────────────────────────────────

const ROLE_LABELS: Record<PaletteColor['role'], string> = {
  background: '배경',
  surface: '서피스',
  primary: '프라이머리',
  accent: '액센트',
  text: '텍스트',
};

// ─── Luminance helpers ───────────────────────────────────────────────────────

/**
 * Convert a single 8-bit channel (0–255) to linear light value.
 * Per WCAG 2.x spec.
 */
function linearize(c8bit: number): number {
  const c = c8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Returns relative luminance in [0, 1] for a hex color string ("#RRGGBB").
 */
function relativeLuminance(hex: string): number {
  const raw = hex.replace('#', '');
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Returns a legible foreground color ('#fff' or '#111') for a given swatch hex.
 */
function swatchTextColor(hex: string): '#fff' | '#111' {
  return relativeLuminance(hex) > 0.5 ? '#111' : '#fff';
}

// ─── Size config ─────────────────────────────────────────────────────────────

const SWATCH_HEIGHT: Record<NonNullable<ColorChipProps['size']>, string> = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ColorChip({
  color,
  index = 0,
  size = 'md',
  showMeta = true,
}: ColorChipProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const textColor = swatchTextColor(color.hex);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      toast({
        title: `복사됨: ${color.hex.toUpperCase()}`,
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed — silently ignore
    }
  }, [color.hex, toast]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="flex flex-col w-full"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Swatch ─────────────────────────────────────────────────── */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={handleCopy}
        aria-label={`${color.name} (${color.hex}) 클릭하여 복사`}
        className={cn(
          'group relative w-full rounded-sm overflow-hidden cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-400',
          SWATCH_HEIGHT[size],
        )}
        style={{ backgroundColor: color.hex }}
      >
        {/* Hex overlay — appears on hover, bottom-left corner */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute bottom-0 left-0 right-0',
            'flex items-center justify-between px-3 py-2',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          )}
          style={{
            background: `linear-gradient(to top, ${color.hex}dd 0%, transparent 100%)`,
          }}
        >
          <span
            className="font-mono text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: textColor }}
          >
            {color.hex.toUpperCase()}
          </span>
          <span
            className="p-1 rounded"
            style={{ color: textColor, opacity: 0.8 }}
          >
            {copied ? (
              <Check size={12} strokeWidth={2.5} />
            ) : (
              <Copy size={12} strokeWidth={2} />
            )}
          </span>
        </motion.div>
      </motion.button>

      {/* ── Metadata ───────────────────────────────────────────────── */}
      {showMeta && (
        <div className="mt-3 space-y-1.5 px-0.5">
          {/* Hex + copy row */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] tracking-widest uppercase text-stone-500 select-all">
              {color.hex.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`${color.hex} 복사`}
              className={cn(
                'p-1 rounded transition-colors duration-150',
                'text-stone-400 hover:text-stone-700 hover:bg-stone-100',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400',
              )}
            >
              {copied ? (
                <Check size={12} strokeWidth={2.5} className="text-emerald-600" />
              ) : (
                <Copy size={12} strokeWidth={1.75} />
              )}
            </button>
          </div>

          {/* Korean color name */}
          <p className="text-sm font-medium text-stone-800 leading-snug truncate">
            {color.name}
          </p>

          {/* Role badge */}
          <span
            className={cn(
              'inline-block text-[10px] font-semibold tracking-[0.12em] uppercase',
              'px-1.5 py-0.5 rounded-sm',
              'bg-stone-100 text-stone-500',
            )}
          >
            {ROLE_LABELS[color.role]}
          </span>

          {/* Usage hint */}
          {color.usage && (
            <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
              {color.usage}
            </p>
          )}
        </div>
      )}
    </motion.article>
  );
}
