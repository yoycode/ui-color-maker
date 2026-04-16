import axios from 'axios';
import type { GeneratePaletteRequest, GeneratePaletteResponse } from './types';
import { generatePaletteResponseSchema } from './schema';

export async function generatePalette(
  request: GeneratePaletteRequest
): Promise<GeneratePaletteResponse> {
  const { data } = await axios.post<unknown>('/api/palette', request);
  return generatePaletteResponseSchema.parse(data);
}
