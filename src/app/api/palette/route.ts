import OpenAI from 'openai';
import {
  generatePaletteRequestSchema,
  paletteSchema,
} from '@/features/palette/schema';
import type { Palette, PaletteColor } from '@/features/palette/types';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `당신은 에디토리얼/매거진 브랜딩 전문 시니어 UI 디자이너입니다.
세련되고 감각적인 색상 팔레트를 만드는 것이 당신의 전문 분야입니다.
유치하거나 단순한 색상 조합은 절대 사용하지 않으며, 항상 고급스럽고 무드 있는 팔레트를 제안합니다.

다음 규칙을 반드시 지켜주세요:
1. 정확히 5개의 색상을 포함해야 합니다
2. 각 색상은 고유한 role을 가져야 합니다: background, surface, primary, accent, text (각 1개씩)
3. 색상 이름은 무드를 담은 한국어로 작성합니다 (예: "안개 낀 새벽", "달빛 미색", "한강의 고요")
4. usage(사용 힌트)는 한국어로 작성합니다
5. mood(무드 설명)는 한국어 1문장으로 작성합니다
6. hex 코드는 반드시 #RRGGBB 형식 (6자리 16진수)이어야 합니다

반드시 다음 JSON 형식으로만 응답하세요:
{
  "mood": "이 팔레트의 전반적인 무드를 설명하는 한 문장",
  "colors": [
    {"hex": "#XXXXXX", "name": "한국어 색상 이름", "role": "background", "usage": "한국어 사용 힌트"},
    {"hex": "#XXXXXX", "name": "한국어 색상 이름", "role": "surface", "usage": "한국어 사용 힌트"},
    {"hex": "#XXXXXX", "name": "한국어 색상 이름", "role": "primary", "usage": "한국어 사용 힌트"},
    {"hex": "#XXXXXX", "name": "한국어 색상 이름", "role": "accent", "usage": "한국어 사용 힌트"},
    {"hex": "#XXXXXX", "name": "한국어 색상 이름", "role": "text", "usage": "한국어 사용 힌트"}
  ]
}`;

function buildUserPrompt(
  keywords: string[],
  random: boolean,
  lockedColors?: PaletteColor[]
): string {
  let prompt: string;

  if (random || keywords.length === 0) {
    prompt =
      '독창적이고 흥미로운 에디토리얼 팔레트를 자유롭게 만들어줘. 예상치 못한 색상 조합으로 감각적인 무드를 표현해줘.';
  } else {
    prompt = `다음 컨셉 키워드를 바탕으로 톤앤매너에 맞는 5색 팔레트를 만들어줘: ${keywords.join(', ')}`;
  }

  if (lockedColors && lockedColors.length > 0) {
    const lockedList = lockedColors
      .map((c) => `- ${c.role}: ${c.hex} (${c.name})`)
      .join('\n');
    prompt += `\n\n다음 색상들은 고정되어 있으니 나머지 색상들이 이와 조화를 이루도록 만들어줘:\n${lockedList}`;
  }

  return prompt;
}

interface OpenAIPaletteResponse {
  mood: string;
  colors: Array<{
    hex: string;
    name: string;
    role: string;
    usage: string;
  }>;
}

async function callOpenAI(
  client: OpenAI,
  userPrompt: string,
  temperature: number
): Promise<OpenAIPaletteResponse> {
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned empty response');
  }

  return JSON.parse(content) as OpenAIPaletteResponse;
}

export async function POST(request: Request): Promise<Response> {
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('[palette/route] OPENAI_API_KEY is not set');
    return Response.json(
      { error: 'OpenAI API key가 설정되지 않았습니다. .env.local 파일을 확인해주세요.' },
      { status: 500 }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '요청 본문을 파싱할 수 없습니다.' }, { status: 400 });
  }

  const parseResult = generatePaletteRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      { error: '잘못된 요청 형식입니다.', details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { keywords, random = false, lockedColors } = parseResult.data;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const temperature = random || keywords.length === 0 ? 0.9 : 0.7;
  const userPrompt = buildUserPrompt(keywords, random, lockedColors);

  // Call OpenAI with one retry on JSON parse failure
  let rawResponse: OpenAIPaletteResponse;
  try {
    rawResponse = await callOpenAI(client, userPrompt, temperature);
  } catch (err) {
    if (err instanceof SyntaxError) {
      // JSON parse failed — retry once
      try {
        console.error('[palette/route] JSON parse failed on first attempt, retrying...');
        rawResponse = await callOpenAI(client, userPrompt, temperature);
      } catch (retryErr) {
        console.error('[palette/route] Retry also failed:', retryErr instanceof Error ? retryErr.message : retryErr);
        return Response.json(
          { error: 'AI 응답을 파싱하는 데 실패했습니다. 다시 시도해주세요.' },
          { status: 500 }
        );
      }
    } else {
      console.error('[palette/route] OpenAI call failed:', err instanceof Error ? err.message : err);
      return Response.json(
        { error: 'AI 팔레트 생성 중 오류가 발생했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }
  }

  // Validate OpenAI response structure
  const colorsValidation = rawResponse?.colors;
  if (!Array.isArray(colorsValidation) || colorsValidation.length !== 5 || !rawResponse.mood) {
    console.error('[palette/route] OpenAI response shape invalid:', rawResponse);
    return Response.json(
      { error: 'AI가 올바른 형식의 팔레트를 반환하지 않았습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }

  // Build final palette object
  let finalColors: PaletteColor[] = rawResponse.colors.map((c) => ({
    hex: c.hex,
    name: c.name,
    role: c.role as PaletteColor['role'],
    usage: c.usage,
  }));

  // If lockedColors provided, replace colors by role match
  if (lockedColors && lockedColors.length > 0) {
    finalColors = finalColors.map((color) => {
      const locked = lockedColors.find((lc) => lc.role === color.role);
      return locked ?? color;
    });
  }

  const palette: Palette = {
    id: crypto.randomUUID(),
    keywords: keywords.length > 0 ? keywords : ['랜덤'],
    mood: rawResponse.mood,
    colors: finalColors,
    createdAt: Date.now(),
    isRandom: random,
  };

  // Validate final palette against schema
  const paletteValidation = paletteSchema.safeParse(palette);
  if (!paletteValidation.success) {
    console.error('[palette/route] Final palette validation failed:', paletteValidation.error.flatten());
    return Response.json(
      { error: 'AI가 생성한 팔레트가 유효하지 않습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }

  return Response.json(paletteValidation.data, { status: 200 });
}
