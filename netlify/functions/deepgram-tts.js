// ============================================
// DEEPGRAM TTS PROXY - Netlify Serverless Function
// Proxies text-to-speech requests to Deepgram API
// so the API key is never exposed to the browser.
// ============================================

exports.handler = async function(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
  if (!DEEPGRAM_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Deepgram API key not configured on server.' })
    };
  }

  let text;
  try {
    ({ text } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing or empty text field.' }) };
  }

  // Truncate to 2000 chars max as a safety limit
  const safeText = text.trim().slice(0, 2000);

  try {
    const response = await fetch(
      'https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=mp3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: safeText })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Deepgram TTS error:', response.status, errText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Deepgram TTS request failed.', detail: errText })
      };
    }

    // Return audio as base64 so it travels safely through Netlify's response
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ audio: base64Audio, encoding: 'mp3' })
    };
  } catch (err) {
    console.error('Deepgram TTS fetch error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' })
    };
  }
};
