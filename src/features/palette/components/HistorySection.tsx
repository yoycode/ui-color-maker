'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHistoryStore, useHydratedHistory } from '../store/historyStore';
import type { Palette } from '../types';

// ─── Types ──────────────────────────────────────────────────────────────────

type HistorySectionProps = {
  currentPaletteId?: string | null;
  onSelect: (palette: Palette) => void;
};

// ─── Mini palette card ──────────────────────────────────────────────────────

function HistoryCard({
  palette,
  index,
  active,
  onSelect,
}: {
  palette: Palette;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={{
        delay: index * 0.04,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className={cn(
        'group flex shrink-0 flex-col gap-3 text-left',
        'w-[260px] md:w-[280px]',
        'rounded-xl border bg-white p-4',
        'transition-all',
        active
          ? 'border-stone-900 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.18)]'
          : 'border-stone-200 hover:border-stone-400',
      )}
      aria-label={`${palette.mood} 팔레트 적용`}
    >
      {/* Color strip */}
      <div className="flex h-16 w-full overflow-hidden rounded-md ring-1 ring-stone-100">
        {palette.colors.map((color, i) => (
          <div
            key={`${palette.id}-strip-${i}`}
            className="flex-1 transition-transform duration-300 group-hover:scale-y-110"
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>

      {/* Mood */}
      <p className="font-serif italic text-base leading-snug text-stone-900 line-clamp-2">
        {palette.mood}
      </p>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1">
        {palette.keywords.slice(0, 4).map((k) => (
          <span
            key={k}
            className="text-[10px] tracking-wide text-stone-500"
          >
            #{k}
          </span>
        ))}
        {palette.keywords.length > 4 && (
          <span className="text-[10px] text-stone-400">
            +{palette.keywords.length - 4}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function HistorySection({
  currentPaletteId,
  onSelect,
}: HistorySectionProps) {
  const { history, hasHydrated } = useHydratedHistory();
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const [confirming, setConfirming] = useState(false);

  if (!hasHydrated) return null;
  if (history.length === 0) return null;

  const handleClear = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    clearHistory();
    setConfirming(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      aria-labelledby="history-heading"
    >
      {/* Section header */}
      <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
            <History className="h-3 w-3" strokeWidth={2.5} />
            <span>Archive</span>
          </div>
          <h2
            id="history-heading"
            className="font-serif text-2xl md:text-3xl text-stone-900"
          >
            최근 생성된 팔레트
            <span className="ml-3 font-sans text-sm font-normal not-italic text-stone-400 align-middle">
              {history.length}건
            </span>
          </h2>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className={cn(
            'gap-1.5 rounded-full text-xs',
            confirming
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              : 'text-stone-500 hover:text-stone-900',
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {confirming ? '한 번 더 클릭하면 삭제' : '전체 삭제'}
        </Button>
      </div>

      {/* Horizontal scroll */}
      <div className="relative -mx-6 md:-mx-10">
        <div
          className={cn(
            'flex gap-4 overflow-x-auto px-6 md:px-10 pb-4',
            'scrollbar-thin',
          )}
        >
          <AnimatePresence initial={false}>
            {history.map((palette, i) => (
              <HistoryCard
                key={palette.id}
                palette={palette}
                index={i}
                active={palette.id === currentPaletteId}
                onSelect={() => onSelect(palette)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
