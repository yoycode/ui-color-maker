'use client';

import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Palette } from '@/features/palette/types';

type HistoryStore = {
  history: Palette[];
  addPalette: (palette: Palette) => void;
  removePalette: (id: string) => void;
  clearHistory: () => void;
};

const MAX_HISTORY_ITEMS = 20;
const STORAGE_KEY = 'ui-color-maker-history';

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addPalette: (palette: Palette) => {
        set((state) => {
          // Remove duplicate if it already exists
          const filtered = state.history.filter((p) => p.id !== palette.id);
          // Prepend new palette (newest first)
          const updated = [palette, ...filtered];
          // Keep only the last MAX_HISTORY_ITEMS
          return { history: updated.slice(0, MAX_HISTORY_ITEMS) };
        });
      },
      removePalette: (id: string) => {
        set((state) => ({
          history: state.history.filter((p) => p.id !== id),
        }));
      },
      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
    }
  )
);

/**
 * Hook to safely access hydrated history in client components.
 * Prevents hydration mismatches by tracking hydration state.
 * Use this in components to ensure localStorage is synced before rendering.
 */
export function useHydratedHistory() {
  const [hasHydrated, setHasHydrated] = React.useState(false);
  const history = useHistoryStore((state) => state.history);

  React.useEffect(() => {
    // Rehydrate the store from localStorage
    useHistoryStore.persist.rehydrate();
    setHasHydrated(true);
  }, []);

  return { history, hasHydrated };
}
