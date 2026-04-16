'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGeneratePalette } from '@/features/palette/hooks/useGeneratePalette';
import KeywordInput from '@/features/palette/components/KeywordInput';
import ResultSection from '@/features/palette/components/ResultSection';
import HistorySection from '@/features/palette/components/HistorySection';
import type { Palette } from '@/features/palette/types';

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const { toast } = useToast();
  const mutation = useGeneratePalette();

  // Track the palette currently displayed (may come from a history pick)
  const [activePalette, setActivePalette] = useState<Palette | null>(null);
  // Remember last submitted keywords to support "다시 생성"
  const [lastKeywords, setLastKeywords] = useState<string[] | null>(null);
  const [lastWasRandom, setLastWasRandom] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Sync mutation result → active palette
  useEffect(() => {
    if (mutation.data) {
      setActivePalette(mutation.data);
    }
  }, [mutation.data]);

  // Surface errors via toast
  useEffect(() => {
    if (mutation.isError) {
      toast({
        title: '팔레트 생성 실패',
        description:
          mutation.error?.message ?? '잠시 후 다시 시도해 주세요.',
        variant: 'destructive',
      });
    }
  }, [mutation.isError, mutation.error, toast]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const scrollToResult = useCallback(() => {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, []);

  const handleSubmitKeywords = useCallback(
    (keywords: string[]) => {
      if (keywords.length === 0) return;
      setLastKeywords(keywords);
      setLastWasRandom(false);
      mutation.mutate({ keywords });
      scrollToResult();
    },
    [mutation, scrollToResult],
  );

  const handleRandom = useCallback(() => {
    setLastKeywords([]);
    setLastWasRandom(true);
    mutation.mutate({ keywords: [], random: true });
    scrollToResult();
  }, [mutation, scrollToResult]);

  const handleRegenerate = useCallback(() => {
    if (lastWasRandom) {
      mutation.mutate({ keywords: [], random: true });
      return;
    }
    if (lastKeywords && lastKeywords.length > 0) {
      mutation.mutate({ keywords: lastKeywords });
      return;
    }
    if (activePalette) {
      mutation.mutate({ keywords: activePalette.keywords });
    }
  }, [activePalette, lastKeywords, lastWasRandom, mutation]);

  const handleRetry = useCallback(() => {
    handleRegenerate();
  }, [handleRegenerate]);

  const handleHistorySelect = useCallback((palette: Palette) => {
    setActivePalette(palette);
    setLastKeywords(palette.keywords);
    setLastWasRandom(Boolean(palette.isRandom));
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-50 text-stone-900">
      {/* Subtle paper grain background */}
      <DecorativeBackground />

      {/* Top nav */}
      <TopNav />

      {/* Editorial hero */}
      <main className="relative">
        <HeroSection
          onSubmit={handleSubmitKeywords}
          onRandom={handleRandom}
          isPending={mutation.isPending}
        />

        {/* Hairline rule */}
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="h-px bg-stone-200" />
        </div>

        {/* Result */}
        <section
          ref={resultRef}
          className="relative mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-24"
          aria-labelledby="result-heading"
        >
          <h2 id="result-heading" className="sr-only">
            생성된 팔레트
          </h2>
          <ResultSection
            palette={activePalette}
            isPending={mutation.isPending}
            isError={mutation.isError && !mutation.isPending}
            errorMessage={mutation.error?.message}
            onRetry={handleRetry}
            onRegenerate={handleRegenerate}
          />
        </section>

        {/* Hairline rule */}
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="h-px bg-stone-200" />
        </div>

        {/* History */}
        <section className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-20">
          <HistorySection
            currentPaletteId={activePalette?.id}
            onSelect={handleHistorySelect}
          />
        </section>

        {/* Footer */}
        <SiteFooter />
      </main>
    </div>
  );
}

// ─── Top Nav ────────────────────────────────────────────────────────────────

function TopNav() {
  return (
    <header className="relative z-10 border-b border-stone-200/80 backdrop-blur-sm bg-stone-50/70">
      <div className="mx-auto max-w-6xl px-6 md:px-10 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-baseline gap-1.5"
          aria-label="UI Color Maker 홈"
        >
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900 leading-none">
            COLOR
          </span>
          <span className="font-serif italic text-xl text-stone-500 leading-none">
            · maker
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <span className="hidden md:inline text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
            Editorial · Issue 01
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className="ml-3 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

type HeroSectionProps = {
  onSubmit: (keywords: string[]) => void;
  onRandom: () => void;
  isPending: boolean;
};

function HeroSection({ onSubmit, onRandom, isPending }: HeroSectionProps) {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="flex flex-col gap-10 md:gap-14">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-10 bg-stone-400" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-stone-500">
              Editorial · Issue 01
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={[
              'font-serif text-stone-900',
              'text-[clamp(2.5rem,7vw,5.75rem)]',
              'leading-[1.02] tracking-[-0.015em]',
              'max-w-5xl',
            ].join(' ')}
          >
            <span className="block">
              컨셉을 입력하면<span className="text-stone-400">,</span>
            </span>
            <span className="block italic">
              팔레트가 됩니다
              <span className="not-italic text-stone-300">.</span>
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-2xl text-base md:text-lg text-stone-600 leading-relaxed"
          >
            <span className="font-serif italic text-stone-900">
              봄, 청순, 한강
            </span>
            {' — '}
            단어 몇 개로 톤앤매너에 맞는{' '}
            <span className="font-medium text-stone-900">5색 UI 팔레트</span>를
            받아보세요. 바로 CSS 변수와 JSON으로 가져갈 수 있습니다.
          </motion.p>

          {/* Input */}
          <KeywordInput
            isPending={isPending}
            onSubmit={onSubmit}
            onRandom={onRandom}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function SiteFooter() {
  return (
    <footer className="border-t border-stone-200">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-serif text-lg text-stone-900">
            COLOR
            <span className="italic text-stone-500"> · maker</span>
          </p>
          <p className="text-xs text-stone-500">
            Editorial · Issue 01 — 컨셉으로 만드는 컬러 팔레트
          </p>
        </div>

        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
          Crafted with care · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

// ─── Decorative background ──────────────────────────────────────────────────

function DecorativeBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Soft top gradient wash */}
      <div
        className="absolute inset-x-0 top-0 h-[480px] opacity-60"
        style={{
          background:
            'radial-gradient(80% 60% at 20% 0%, rgba(214,196,168,0.18) 0%, transparent 60%), radial-gradient(60% 50% at 100% 10%, rgba(168,184,214,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Faint vertical rule echoing magazine columns */}
      <div className="absolute inset-y-0 left-1/2 hidden md:block w-px bg-stone-200/40" />
      {/* SVG noise grain */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-multiply"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
