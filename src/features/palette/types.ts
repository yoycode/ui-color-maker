import { z } from 'zod';
import {
  hexColorSchema,
  paletteColorSchema,
  paletteSchema,
  generatePaletteRequestSchema,
  generatePaletteResponseSchema,
} from './schema';

// Type inference from zod schemas
export type Palette = z.infer<typeof paletteSchema>;
export type PaletteColor = z.infer<typeof paletteColorSchema>;
export type ColorRole = PaletteColor['role'];
export type GeneratePaletteRequest = z.infer<typeof generatePaletteRequestSchema>;
export type GeneratePaletteResponse = z.infer<typeof generatePaletteResponseSchema>;

// Re-export schemas for convenience
export {
  hexColorSchema,
  paletteColorSchema,
  paletteSchema,
  generatePaletteRequestSchema,
  generatePaletteResponseSchema,
};
