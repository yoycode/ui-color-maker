'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Code2,
  Copy,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ColorChip from './ColorChip';
import PreviewPanel from './preview/PreviewPanel';
import type { Palette, PaletteColor } from '../types';

// ─── Types ──────────────────────────────────────────────────────────────────

type ResultSectionProps = {
  palette: Palette | null;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onRegenerate: () => void;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const ROLE_VAR_NAME: Record<PaletteColor['role'], string> = {
  background: '--color-background',
  surface: '--color-surface',
  primary: '--color-primary',
  accent: '--color-accent',
  text: '--color-text',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildCssVariables(colors: PaletteColor[]): string {
  const lines = colors
    .map((c) => `  ${ROLE_VAR_NAME[c.role]}: ${c.hex.toUpperCase()};`)
    .join('\n');
  return `:root {\n${lines}\n}`;
}

function buildJson(palette: Palette): string {
  return JSON.stringify(
    {
      mood: palette.mood,
      keywords: palette.keywords,
      colors: palette.colors.map((c) => ({
        hex: c.hex.toUpperCase(),
        name: c.name,
        role: c.role,
        usage: c.usage,
      })),
    },
    null,
    2,
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonChip({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="flex flex-col w-full"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-sm bg-stone-200">
        <motion.div
          className="absolute inset-0 -translate-x-full"
          animate={{ translateX: ['-100%', '100%'] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'linear',
            delay: index * 0.15,
          }}
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
          }}
        />
      </div>
      <div className="mt-3 space-y-2 px-0.5">
        <div className="h-3 w-20 rounded bg-stone-200" />
        <div className="h-4 w-full rounded bg-stone-200" />
        <div className="h-3 w-16 rounded bg-stone-100" />
      </div>
    </motion.div>
  );
}

// ─── Loading state ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <div className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
          Plate · 진행 중
        </div>
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
          <p className="text-2xl md:text-3xl font-serif italic text-stone-800">
            팔레트를 짓는 중…
          </p>
        </div>
        <p className="text-sm text-stone-500 max-w-prose">
          키워드를 다섯 가지 색의 위계로 옮겨 적고 있어요. 잠시만 기다려 주세요.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonChip key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border border-stone-300 bg-white p-8',
        'flex flex-col gap-4 items-start',
      )}
    >
      <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">
        Errata · 오류
      </span>
      <p className="text-xl font-serif italic text-stone-900">
        팔레트를 만들지 못했습니다.
      </p>
      <p className="text-sm text-stone-600 max-w-prose">{message}</p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="gap-2 rounded-full"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        다시 시도
      </Button>
    </motion.div>
  );
}

// ─── Main result ────────────────────────────────────────────────────────────

function PaletteResult({
  palette,
  onRegenerate,
}: {
  palette: Palette;
  onRegenerate: () => void;
}) {
  const { toast } = useToast();
  const [copiedTarget, setCopiedTarget] = useState<'css' | 'json' | null>(null);

  const cssVars = useMemo(() => buildCssVariables(palette.colors), [palette]);
  const jsonText = useMemo(() => buildJson(palette), [palette]);

  const copyTo = useCallback(
    async (target: 'css' | 'json', text: string, successLabel: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedTarget(target);
        toast({ title: successLabel, duration: 1800 });
        setTimeout(() => setCopiedTarget(null), 1500);
      } catch {
        toast({
          title: '복사에 실패했습니다',
          description: '브라우저 권한을 확인해 주세요.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  return (
    <motion.div
      key={palette.id}
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      {/* Plate header */}
      <div className="space-y-4">
        <div className="flex items-baseline gap-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
          <span>Plate</span>
          <span className="h-px w-8 bg-stone-300" />
          <span className="text-stone-600">
            {palette.isRandom ? '랜덤 컴포지션' : '컨셉 팔레트'}
          </span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
          <h2 className="font-serif italic text-3xl md:text-5xl leading-tight text-stone-900 max-w-3xl">
            “{palette.mood}”
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {palette.keywords.map((k) => (
              <Badge
                key={k}
                variant="outline"
                className="rounded-full border-stone-300 bg-white text-stone-600 font-normal text-xs"
              >
                #{k}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Color chips */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {palette.colors.map((color, i) => (
          <ColorChip
            key={`${palette.id}-${color.role}-${i}`}
            color={color}
            index={i}
          />
        ))}
      </div>

      {/* Preview panel */}
      <div className="pt-4">
        <div className="mb-4 flex items-center gap-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
          <span>Specimen</span>
          <span className="h-px flex-1 bg-stone-200" />
        </div>
        <PreviewPanel palette={palette} />
      </div>

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={onRegenerate}
          variant="default"
          className="gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          다시 생성
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            copyTo('css', cssVars, 'CSS 변수가 클립보드에 복사되었습니다')
          }
          className="gap-2 rounded-full border-stone-300"
        >
          {copiedTarget === 'css' ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          CSS 변수 복사
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            copyTo('json', jsonText, 'JSON이 클립보드에 복사되었습니다')
          }
          className="gap-2 rounded-full border-stone-300"
        >
          {copiedTarget === 'json' ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Code2 className="h-3.5 w-3.5" />
          )}
          JSON 복사
        </Button>

        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-stone-500">
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          히스토리에 저장됨
        </span>
      </div>
    </motion.div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className={cn(
        'relative rounded-2xl border border-dashed border-stone-300',
        'bg-white/40 backdrop-blur-sm',
        'px-6 py-16 md:py-24 text-center',
      )}
    >
      <div className="mx-auto max-w-md space-y-5">
        <div className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
          Awaiting · 대기 중
        </div>
        <p className="font-serif italic text-2xl md:text-3xl text-stone-700 leading-snug">
          어떤 무드를 그려볼까요?
        </p>
        <p className="text-sm text-stone-500 leading-relaxed">
          컨셉 키워드를 적거나, 추천 키워드를 눌러보세요. 랜덤 팔레트로
          영감만 얻어가도 좋아요.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ResultSection({
  palette,
  isPending,
  isError,
  errorMessage,
  onRetry,
  onRegenerate,
}: ResultSectionProps) {
  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        message={errorMessage ?? '알 수 없는 오류가 발생했습니다.'}
        onRetry={onRetry}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {palette ? (
        <PaletteResult
          key={palette.id}
          palette={palette}
          onRegenerate={onRegenerate}
        />
      ) : (
        <EmptyState key="empty" />
      )}
    </AnimatePresence>
  );
}
