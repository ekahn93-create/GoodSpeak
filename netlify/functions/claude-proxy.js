// ============================================
// CLAUDE PROXY - Netlify Serverless Function
// Proxies requests to Anthropic API server-side
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

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured on server.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
  }

  const { task, payload } = body;

  // Build the prompt based on the requested task
  let prompt = '';

  if (task === 'two_words_and_a_lie') {
    const { word, partOfSpeech, definition, exampleSentence } = payload;
    prompt = `You are helping with a vocabulary learning game called "2 Words and a Lie".

The word is: "${word}"
Part of speech: ${partOfSpeech}
Definition: ${definition}
Example sentence: ${exampleSentence}

Generate exactly 3 sentences using the word "${word}":
- Sentence A: A correct, natural usage of the word
- Sentence B: Another correct, natural usage (different context from A and from the example)
- Sentence C: An INCORRECT usage — the word is used in a way that subtly violates its meaning or part of speech. It should be plausible enough to fool someone who doesn't know the word well, but clearly wrong to someone who does.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "sentences": [
    { "text": "...", "correct": true },
    { "text": "...", "correct": true },
    { "text": "...", "correct": false }
  ],
  "explanation": "One sentence explaining why the incorrect sentence is wrong."
}

Shuffle the order of the sentences randomly so the incorrect one is not always last.`;
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown task.' }) };
  }

  try {
    console.log('Calling Anthropic API...');
    console.log('Node version:', process.version);
    console.log('fetch available:', typeof fetch);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    console.log('Anthropic response status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return {
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Upstream API error.', status: response.status, detail: errText })
      };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    // Validate that we got parseable JSON back
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return {
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Model returned non-JSON response.', raw: content })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    console.error('Function error:', err.name, err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error.', name: err.name, detail: err.message })
    };
  }
};
