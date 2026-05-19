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
  } else if (task === 'storytelling_feedback') {
    const { prompt: storyPrompt, transcript, isSpeech } = payload;
    const inputType = isSpeech ? 'spoken response (transcribed)' : 'written response';
    prompt = `You are a speaking coach giving feedback on a ${inputType} to a storytelling prompt.

Prompt given to the user: "${storyPrompt}"

User's response:
"""
${transcript}
"""

Evaluate the response on these 5 dimensions and give one actionable improvement tip. Be encouraging but honest. Keep each dimension to 1–2 sentences.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "relevance": "...",
  "structure": "...",
  "engagement": "...",
  "vocabulary": "...",
  "tip": "..."
}`;
  } else if (task === 'read_aloud_feedback') {
    const { passage, transcript } = payload;
    prompt = `You are a speaking coach reviewing a read-aloud session.

Original passage the user was asked to read:
"""
${passage}
"""

What the user actually said (transcribed):
"""
${transcript}
"""

Give brief, encouraging feedback on 3 dimensions, then one actionable tip. Keep each dimension to 1–2 sentences.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "coverage": "...",
  "delivery": "...",
  "accuracy": "...",
  "tip": "..."
}`;

  } else if (task === 'daily_drill_feedback') {
    const { prompt: drillPrompt, transcript } = payload;
    prompt = `You are a speaking coach reviewing a 60-second impromptu speech.

Topic the user was given: "${drillPrompt}"

What the user said:
"""
${transcript}
"""

Evaluate on 3 dimensions and give one actionable tip. Be encouraging but honest. Keep each to 1–2 sentences.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "structure": "...",
  "specificity": "...",
  "delivery": "...",
  "tip": "..."
}`;

  } else if (task === 'word_enrichment') {
    const { word, partOfSpeech, definition, example } = payload;
    prompt = `You are a vocabulary coach helping someone deeply learn a new word.

Word: "${word}"
Part of speech: ${partOfSpeech}
Definition: ${definition}
Example sentence: ${example || 'none provided'}

Generate 2 additional natural example sentences using this word, and a short memorable mnemonic (a vivid image or phrase) to help them remember what it means.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "examples": ["...", "..."],
  "mnemonic": "..."
}`;

  } else if (task === 'generate_exercise') {
    const { exerciseType, topic } = payload;
    const exerciseInstructions = {
      tongue_twister: 'Create one original tongue twister (alliterative or phonetically challenging). Return just the tongue twister text as "content" and the target sound as "label".',
      pacing_passage: 'Write a short 3–4 sentence passage (suitable for reading aloud at a measured pace) on the given topic. Return the passage as "content" and a brief delivery note as "label".',
      metaphor: 'Create one vivid metaphor about the given topic. Return the metaphor as "content" and a one-sentence explanation as "label".',
      simile: 'Create one vivid simile about the given topic. Return the simile as "content" and a one-sentence explanation as "label".',
      sentence_combining: 'Write two short related sentences that can be elegantly combined into one. Return them as an array ["sentence1", "sentence2"] in "content" and a hint for combining as "label".'
    };
    const instructions = exerciseInstructions[exerciseType] || exerciseInstructions.tongue_twister;
    prompt = `You are a speech and communication coach generating a practice exercise.

Topic/theme: "${topic || 'general'}"
Exercise type: ${exerciseType}

${instructions}

Respond ONLY with valid JSON in this exact format, no other text:
{
  "content": "...",
  "label": "..."
}`;

  } else if (task === 'grade_sentence') {
    const { word, partOfSpeech, definition, sentence } = payload;
    prompt = `You are a vocabulary coach grading a student's use of a word in a sentence.

Word: "${word}"
Part of speech: ${partOfSpeech}
Definition: ${definition}

Student's sentence: "${sentence}"

Evaluate whether the student used the word correctly. Be encouraging but honest. Keep feedback to 1–2 sentences.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "correct": true or false,
  "feedback": "...",
  "suggestion": "An example of a better or alternative sentence using the word (only if correct is false, otherwise null)."
}`;

  } else if (task === 'daily_speaking_feedback') {
    const { word, definition, partOfSpeech, transcript } = payload;
    prompt = `You are a speaking coach reviewing a student's spoken response about a vocabulary word.

Word: "${word}"
Part of speech: ${partOfSpeech}
Definition: ${definition}

What the student said (transcribed from speech):
"""
${transcript}
"""

Evaluate on 3 dimensions and give one actionable tip. Be encouraging but honest. Keep each to 1–2 sentences.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "word_usage": "Did they use or meaningfully reference the word? Was it correct?",
  "clarity": "How clear and well-structured was their response?",
  "vocabulary": "Any notes on their overall word choice and expression.",
  "tip": "One specific, actionable improvement tip."
}`;

  } else if (task === 'conversation_starters') {
    const { situation } = payload;
    prompt = `You are a communication coach helping someone practice conversation skills.

Generate exactly 4 natural, varied conversation starters for this situation: "${situation}"

The starters should feel genuine and easy to actually say out loud — not stiff or overly formal. Mix different types (questions, observations, compliments, shared experience references) where appropriate for the situation.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "starters": ["...", "...", "...", "..."]
}`;

  } else if (task === 'description_challenge') {
    prompt = `You are generating a challenge for a speaking exercise app.

Generate a common, everyday object and exactly 5 words that someone would naturally and obviously use when describing it. The forbidden words should be the most obvious/instinctive words for that object — the ones the speaker will have to actively avoid.

Avoid abstract concepts, proper nouns, or anything too obscure. Stick to concrete, familiar objects.

Respond ONLY with valid JSON in this exact format, no other text:
{
  "object": "...",
  "forbidden": ["word1", "word2", "word3", "word4", "word5"]
}`;

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
    let content = data.content?.[0]?.text || '';

    // Strip markdown code fences if present (e.g. ```json ... ```)
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

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
