// Güvenli Gemini API servisi — API key hiçbir zaman frontend'e gitmez.
// Tüm çağrılar /api/gemini proxy endpoint'inden geçer.
// Geliştirme ortamında doğrudan Gemini API çağrısı yapılır (CORS güvenli).

const IS_DEV = import.meta.env.DEV;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // sadece dev'de kullanılır

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function callGemini(prompt: string): Promise<string> {
  if (IS_DEV && GEMINI_API_KEY) {
    // Geliştirme: direkt API (key sadece local .env'de)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Yanıt alınamadı.';
  }

  // Production: backend proxy endpoint
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status}`);
  }

  const data = await response.json();
  return data.text ?? 'Yanıt alınamadı.';
}

export async function analyzeStore(storeData: {
  code: string;
  name: string;
  ciroGerc: number;
  conversion: number;
  upt: number;
  yds: number;
  status: string;
}): Promise<string> {
  const prompt = `
Sen Penti'nin bölge performans analistisisin. Aşağıdaki mağaza verisini inceleyerek kısa (3-4 cümle), aksiyon odaklı bir Türkçe analiz yaz.
Güçlü yanı, kritik riski ve öncelikli aksiyonu belirt.

Mağaza: ${storeData.code} - ${storeData.name}
Ciro Gerçekleşme: %${storeData.ciroGerc}
Dönüşüm Oranı: %${storeData.conversion}
FBA (Fatura Başına Adet): ${storeData.upt}
YDS Skoru: ${storeData.yds}/10
Durum: ${storeData.status}

Sadece analiz yaz, başlık veya madde işareti kullanma.
  `.trim();

  return callGemini(prompt);
}
