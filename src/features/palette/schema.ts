import { z } from 'zod';

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, '올바른 16진수 색상 형식이어야 합니다 (#RRGGBB)');

export const paletteColorSchema = z.object({
  hex: hexColorSchema,
  name: z.string().min(1, '색상 이름은 필수입니다'),
  role: z.enum(['background', 'surface', 'primary', 'accent', 'text']),
  usage: z.string().min(1, '사용 설명은 필수입니다'),
});

export const paletteSchema = z.object({
  id: z.string(),
  keywords: z.string().array().min(1).max(10),
  mood: z.string().min(1, '무드 설명은 필수입니다'),
  colors: paletteColorSchema.array().length(5),
  createdAt: z.number(),
  isRandom: z.boolean().optional(),
});

export const generatePaletteRequestSchema = z.object({
  keywords: z.string().array().max(10),
  random: z.boolean().optional(),
  lockedColors: paletteColorSchema.array().optional(),
});

export const generatePaletteResponseSchema = paletteSchema;
