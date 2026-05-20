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

  try {
    // Create a temporary key scoped to listen (STT) only, expires in 10 seconds.
    // The browser uses this key to open a WebSocket directly to Deepgram.
    const response = await fetch('https://api.deepgram.com/v1/projects', {
      headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}` }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Deepgram projects fetch error:', response.status, errText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch Deepgram project.' })
      };
    }

    const { projects } = await response.json();
    if (!projects || projects.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No Deepgram projects found.' })
      };
    }

    const projectId = projects[0].project_id;

    // Create a temporary key (expires in 10s — enough time to open the WebSocket)
    const keyResponse = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: 'Temporary browser STT key',
          scopes: ['usage:write'],
          time_to_live_in_seconds: 10
        })
      }
    );

    if (!keyResponse.ok) {
      const errText = await keyResponse.text();
      console.error('Deepgram key creation error:', keyResponse.status, errText);
      return {
        statusCode: keyResponse.status,
        body: JSON.stringify({ error: 'Failed to create temporary Deepgram key.' })
      };
    }

    const { key } = await keyResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key })
    };
  } catch (err) {
    console.error('Deepgram token error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' })
    };
  }
};
