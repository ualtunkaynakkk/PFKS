/**
 * Backend Proxy Server — Güvenli API Katmanı
 *
 * Gemini API anahtarı sadece bu dosyada çalışır.
 * Frontend (tarayıcı) hiçbir zaman API anahtarını görmez.
 * Vercel'de bu dosya /api/gemini olarak çalışır.
 */

import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json());

// CORS — sadece kendi origin'imize izin ver
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.ALLOWED_ORIGIN,
  ].filter(Boolean);

  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }

  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Rate limit — basit in-memory (production'da Redis kullan)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // 30 istek / dakika
const WINDOW_MS = 60_000;

app.use('/api/gemini', (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.ip ?? 'unknown';
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || record.resetAt < now) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else if (record.count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Rate limit aşıldı. 1 dakika sonra tekrar deneyin.' });
  } else {
    record.count++;
  }
  next();
});

// Gemini Proxy Endpoint
app.post('/api/gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API anahtarı yapılandırılmamış.' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
    return res.status(400).json({ error: 'Geçersiz istek.' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return res.status(502).json({ error: 'AI servisi geçici olarak kullanılamıyor.' });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Yanıt alınamadı.';
    res.json({ text });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[PFKS Proxy] Çalışıyor: http://localhost:${PORT}`);
  console.log(`[PFKS Proxy] Gemini API key: ${process.env.GEMINI_API_KEY ? '✓ Yüklendi' : '✗ EKSİK'}`);
});
