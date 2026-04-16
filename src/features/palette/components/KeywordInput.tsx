'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Shuffle, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

type KeywordInputProps = {
  isPending: boolean;
  onSubmit: (keywords: string[]) => void;
  onRandom: () => void;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const SUGGESTED_KEYWORDS = [
  '봄밤',
  '청순',
  '한강',
  '미니멀',
  '빈티지 노을',
  '도쿄 야경',
  '파스텔',
  '모노톤',
  '따뜻한 베이지',
  '사이버펑크',
] as const;

const SEPARATOR_REGEX = /[,\s]+/u;

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseKeywords(raw: string): string[] {
  const seen = new Set<string>();
  const parts = raw.split(SEPARATOR_REGEX);
  const result: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result.slice(0, 10);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function KeywordInput({
  isPending,
  onSubmit,
  onRandom,
}: KeywordInputProps) {
  const [draft, setDraft] = useState('');
  const [committed, setCommitted] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combined keyword list = committed pills + currently typed token (if any)
  const liveKeywords = useMemo(() => {
    const fromDraft = parseKeywords(draft);
    const seen = new Set(committed);
    const merged = [...committed];
    for (const k of fromDraft) {
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(k);
    }
    return merged.slice(0, 10);
  }, [committed, draft]);

  const canSubmit = liveKeywords.length > 0 && !isPending;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const commitDraft = useCallback(() => {
    const parsed = parseKeywords(draft);
    if (parsed.length === 0) return;
    setCommitted((prev) => {
      const seen = new Set(prev);
      const next = [...prev];
      for (const k of parsed) {
        if (seen.has(k)) continue;
        seen.add(k);
        next.push(k);
      }
      return next.slice(0, 10);
    });
    setDraft('');
  }, [draft]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!canSubmit) return;
      const finalList = liveKeywords;
      // Persist committed view of what user submitted
      setCommitted(finalList);
      setDraft('');
      onSubmit(finalList);
    },
    [canSubmit, liveKeywords, onSubmit],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Comma commits the current draft as pills, but doesn't submit
      if (e.key === ',' || e.key === 'Enter') {
        if (e.key === 'Enter' && draft.trim() === '') {
          // empty draft + Enter → submit
          handleSubmit();
          return;
        }
        if (e.key === ',') {
          e.preventDefault();
          commitDraft();
          return;
        }
        // Enter with content → commit then submit
        e.preventDefault();
        commitDraft();
        // submit on next tick (after committed updates)
        setTimeout(() => {
          // recompute from latest state via callback
          setCommitted((latest) => {
            if (latest.length > 0) onSubmit(latest);
            return latest;
          });
        }, 0);
      }

      if (e.key === 'Backspace' && draft === '' && committed.length > 0) {
        // remove last pill
        setCommitted((prev) => prev.slice(0, -1));
      }
    },
    [draft, committed.length, commitDraft, handleSubmit, onSubmit],
  );

  const removePill = useCallback((keyword: string) => {
    setCommitted((prev) => prev.filter((k) => k !== keyword));
  }, []);

  const addSuggestion = useCallback(
    (keyword: string) => {
      if (committed.includes(keyword)) return;
      setCommitted((prev) =>
        prev.includes(keyword) ? prev : [...prev, keyword].slice(0, 10),
      );
      inputRef.current?.focus();
    },
    [committed],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* Input frame */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'group relative flex flex-col gap-3',
          'rounded-2xl border border-stone-300 bg-white',
          'p-3 md:p-4',
          'shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]',
          'transition-shadow focus-within:shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_12px_36px_-12px_rgba(0,0,0,0.18)]',
          'focus-within:border-stone-900',
        )}
      >
        {/* Pills row + input + submit */}
        <div className="flex w-full flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {committed.map((keyword) => (
              <motion.span
                key={keyword}
                layout
                initial={{ opacity: 0, scale: 0.85, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full',
                  'bg-stone-900 text-stone-50',
                  'pl-3 pr-1.5 py-1 text-sm font-medium',
                )}
              >
                <span className="text-stone-400 text-xs">#</span>
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => removePill(keyword)}
                  aria-label={`${keyword} 제거`}
                  className="ml-0.5 rounded-full p-0.5 text-stone-400 hover:text-stone-50 hover:bg-stone-700 transition-colors"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitDraft}
            placeholder={
              committed.length === 0
                ? '봄, 청순, 한강 — 컨셉을 적어 주세요'
                : '추가 키워드…'
            }
            aria-label="컨셉 키워드 입력"
            disabled={isPending}
            className={cn(
              'flex-1 min-w-[160px] h-9 border-0 px-2 shadow-none',
              'bg-transparent text-base placeholder:text-stone-400',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
            )}
          />

          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit}
            className={cn(
              'gap-2 rounded-full px-5 h-11',
              'bg-stone-900 text-stone-50 hover:bg-stone-800',
              'disabled:opacity-40',
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>생성 중</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>생성</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Random + suggestion row */}
      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onRandom}
          disabled={isPending}
          className={cn(
            'gap-2 rounded-full h-9 px-4 self-start',
            'border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900',
            'text-sm font-medium',
          )}
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span>랜덤 팔레트</span>
        </Button>

        <div className="flex items-center gap-2 overflow-x-auto md:overflow-visible md:flex-wrap">
          <span className="shrink-0 text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-400">
            추천
          </span>
          <span className="shrink-0 text-stone-300">·</span>
          {SUGGESTED_KEYWORDS.map((keyword) => {
            const active = committed.includes(keyword);
            return (
              <button
                key={keyword}
                type="button"
                onClick={() => addSuggestion(keyword)}
                disabled={isPending || active}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all',
                  'border',
                  active
                    ? 'border-stone-900 bg-stone-900 text-stone-50'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-900 hover:text-stone-900',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {keyword}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
