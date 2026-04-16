'use client';

import { useMutation } from '@tanstack/react-query';
import { generatePalette } from '../api';
import { useHistoryStore } from '../store/historyStore';
import type { GeneratePaletteRequest, GeneratePaletteResponse } from '../types';

export function useGeneratePalette() {
  return useMutation<GeneratePaletteResponse, Error, GeneratePaletteRequest>({
    mutationFn: generatePalette,
    onSuccess: (palette) => {
      useHistoryStore.getState().addPalette(palette);
    },
  });
}
