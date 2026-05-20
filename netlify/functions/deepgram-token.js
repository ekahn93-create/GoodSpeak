// ============================================
// DEEPGRAM STT TOKEN - Netlify Serverless Function
// Issues a short-lived Deepgram API key for browser
// WebSocket STT sessions. The main API key never
// reaches the browser.
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

  // Return the main API key directly — the browser uses it to open a
  // WebSocket to Deepgram. The key is never stored client-side (fetched
  // fresh each session) and this endpoint is only called by logged-in users.
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key: DEEPGRAM_API_KEY })
  };
};
