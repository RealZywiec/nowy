export default async function handler(req, res) {
  // Obsługa CORS (Vercel wymaga ręcznego ustawienia nagłówków w kodzie)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Obsługa zapytania OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sprawdzenie metody
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_KEY not configured' });
  }

  try {
    const { contents, generationConfig } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    
    const geminiBody = {
      contents: contents || [],
      generationConfig: generationConfig || { maxOutputTokens: 600, temperature: 0.7 },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data?.error?.message || 'Gemini API error' 
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(400).json({ error: 'Invalid request or server error' });
  }
}
