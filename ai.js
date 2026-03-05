exports.handler = async (event) => {
  // Tylko POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Brak klucza API po stronie serwera' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const model = 'gemini-2.0-flash';

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data?.error?.message || `HTTP ${res.status}` }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
