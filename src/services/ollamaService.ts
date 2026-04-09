/**
 * ollamaService.ts
 * Calls a local Ollama API to extract receipt info from a base64-encoded image.
 */

export interface ReceiptData {
  merchant: string;
  amount: number | null;
  date: string | null;
  category?: string;
  confidence: 'high' | 'medium' | 'low';
}

// Use the Express proxy to avoid CORS issues (browser → /api/ollama/generate → Express → Ollama)
const OLLAMA_API_URL = '/api/ollama/generate';

function normalizeDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // YY/MM/DD (e.g. 26/04/08)
  const yymmdd = raw.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (yymmdd) return `20${yymmdd[1]}-${yymmdd[2]}-${yymmdd[3]}`;
  // DD/MM/YYYY
  const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  // Try JS Date parse as fallback
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

function inferCategory(merchant: string): string {
  const m = merchant.toLowerCase();
  if (m.includes('superstore') || m.includes('walmart') || m.includes('costco') || m.includes('grocery') || m.includes('sobeys') || m.includes('loblaws')) return 'Food & Drink';
  if (m.includes('restaurant') || m.includes('cafe') || m.includes('coffee') || m.includes('pizza') || m.includes('sushi') || m.includes('kitchen') || m.includes('grill') || m.includes('burger') || m.includes('mcdonald') || m.includes('tim horton') || m.includes('starbucks')) return 'Food & Drink';
  if (m.includes('uber') || m.includes('lyft') || m.includes('taxi') || m.includes('transit') || m.includes('bus') || m.includes('metro')) return 'Transport';
  if (m.includes('ikea') || m.includes('home depot') || m.includes('rent') || m.includes('apartment')) return 'Housing';
  if (m.includes('apple') || m.includes('best buy') || m.includes('samsung') || m.includes('bestbuy')) return 'Electronics';
  if (m.includes('airline') || m.includes('airbnb') || m.includes('hotel') || m.includes('delta') || m.includes('air canada')) return 'Travel';
  if (m.includes('pharmacy') || m.includes('hospital') || m.includes('clinic') || m.includes('shoppers')) return 'Healthcare';
  return 'Other';
}

async function compressImage(base64: string, maxWidth = 1024, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

export async function analyzeReceipt(base64Image: string, _mimeType = 'image/jpeg'): Promise<ReceiptData> {
  const compressed = await compressImage(base64Image);
  const prompt = "Extract merchant name, date, and category from this receipt. For the amount, find the TOTAL line (case-insensitive) and use the number on its right as the amount. Return JSON only with fields: merchant, amount, date, category. No explanation.";

  const response = await fetch(OLLAMA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3-vl:8b',
      prompt,
      stream: false,
      images: [compressed],
      format: 'json',
      options: { temperature: 0.1 }
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama API error: ${response.status} — ${err}`);
  }

  const data = await response.json();

  // qwen3 is a thinking model: Ollama puts output in `thinking` when `response` is empty
  const text: string = data.response || data.thinking || '';
  console.log('[Ollama] text source:', data.response ? 'response' : 'thinking');

  // Strip markdown code fences
  let cleanedText = text.replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1');
  // Strip <think>...</think> blocks (including unclosed ones)
  cleanedText = cleanedText.replace(/<think>[\s\S]*?<\/think>/gi, '');
  cleanedText = cleanedText.replace(/<think>[\s\S]*/gi, '');

  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  const cleaned = jsonMatch ? jsonMatch[0] : '';

  try {
    const parsed = JSON.parse(cleaned);
    const merchant: string = parsed.merchant || 'Unknown';
    const rawCategory: string = parsed.category || '';
    const category = rawCategory && rawCategory !== 'Unknown' ? rawCategory : inferCategory(merchant);

    return {
      merchant,
      amount: parsed.amount ? Number(parsed.amount) : null,
      date: normalizeDate(parsed.date),
      category,
      confidence: 'high',
    };
  } catch {
    throw new Error(`Failed to parse Ollama response: ${text}`);
  }
}
