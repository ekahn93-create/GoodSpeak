// ============================================
// GET-CONFIG — Netlify Serverless Function
// Returns Supabase public credentials to the browser.
// Credentials are stored as Netlify env vars, never in the repo.
// ============================================

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Supabase credentials not configured on server.' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      supabaseUrl,
      supabaseAnonKey
    })
  };
};
