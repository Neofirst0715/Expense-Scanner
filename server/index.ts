import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true }); // .env.local 优先级更高


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ Supabase URL or Anon Key is missing. The API will return mock responses or errors.');
}

// Keep mock data for fallback if Supabase is not configured
let fallbackExpenses = [
  { id: '1', merchant: 'Starbucks', category: 'Food & Drink', date: 'Oct 27, 2023', amount: 5.40, icon: 'Utensils', color: 'bg-orange-100' },
  { id: '2', merchant: 'Uber', category: 'Transport', date: 'Oct 27, 2023', amount: 19.00, icon: 'Car', color: 'bg-blue-100' },
];

app.get('/api/expenses', async (req, res) => {
  if (!supabase) {
    return res.json(fallbackExpenses);
  }
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post('/api/expenses', async (req, res) => {
  const { merchant, category, date, amount, icon, color } = req.body;
  
  const newExpense = {
    merchant,
    category,
    date,
    amount: Number(amount),
    icon,
    color
  };

  if (!supabase) {
    const fallbackExp = { id: Date.now().toString(), ...newExpense };
    fallbackExpenses.unshift(fallbackExp);
    return res.status(201).json(fallbackExp);
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([newExpense] as any)
    .select()
    .single();

  if (error) {
    console.error('Error adding expense:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { merchant, category, date, amount, icon, color } = req.body;
  const updates = { merchant, category, date, amount: Number(amount), icon, color };

  if (!supabase) {
    const idx = fallbackExpenses.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    fallbackExpenses[idx] = { ...fallbackExpenses[idx], ...updates };
    return res.json(fallbackExpenses[idx]);
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (!supabase) {
    fallbackExpenses = fallbackExpenses.filter(e => e.id !== id);
    return res.json({ success: true });
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

// ── Gemini fallback ─────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string, base64Image: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    }
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  // Extract text from Gemini response shape
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}

// Proxy route for Ollama with automatic Gemini fallback
app.post('/api/ollama/generate', async (req, res) => {
  const OLLAMA_TIMEOUT_MS = 3000;

  // ── Try Ollama first ──────────────────────────────────────────────────────
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      console.log('[AI] Served by Ollama');
      return res.json(data);
    }
    // Non-2xx from Ollama → fall through to Gemini
    console.warn(`[AI] Ollama returned ${ollamaRes.status}, falling back to Gemini`);
  } catch (err: any) {
    const reason = err.name === 'AbortError' ? 'timeout' : err.message;
    console.warn(`[AI] Ollama unavailable (${reason}), falling back to Gemini`);
  }

  // ── Fallback: Gemini ──────────────────────────────────────────────────────
  try {
    const { prompt, images } = req.body as { prompt: string; images: string[] };
    const base64Image = images?.[0] ?? '';
    const text = await callGemini(prompt, base64Image);
    console.log('[AI] Served by Gemini');
    // Return Ollama-compatible shape so the frontend parser works unchanged
    return res.json({ response: text });
  } catch (err: any) {
    console.error('[AI] Gemini fallback failed:', err.message);
    return res.status(502).json({ error: `Both Ollama and Gemini failed: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
