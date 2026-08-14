import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const MAX_TOPIC_LENGTH = 200;
const MIN_LINES = 4;
const MAX_LINES = 20;
const DEFAULT_LINES = 10;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error (Supabase)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized or invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: { topic?: string; lineCount?: number };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const topic = (body.topic || '').trim();

  if (!topic) {
    return new Response(JSON.stringify({ error: 'Topic is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    return new Response(
      JSON.stringify({ error: `Topic must be ${MAX_TOPIC_LENGTH} characters or fewer.` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const requestedLines = Number.isFinite(body.lineCount) ? Math.trunc(body.lineCount as number) : DEFAULT_LINES;
  const lineCount = Math.min(MAX_LINES, Math.max(MIN_LINES, requestedLines));

  const systemPrompt = `You write short English dialogue scripts for a language-learning shadowing app. Always respond with a single JSON object only (no markdown, no commentary) matching this exact shape:
{
  "title": string,
  "speakers": [{ "id": "A", "name": string }, { "id": "B", "name": string }],
  "lines": [{ "speakerId": "A" | "B", "text": string }, ...]
}
Rules:
- Exactly 2 speakers, with ids "A" and "B".
- "lines" must alternate naturally between speakers and contain exactly ${lineCount} entries.
- Every "text" value must be natural, conversational English suitable for shadowing practice (no stage directions, no translations, no emojis).
- "title" is a short English title for the scene.`;

  const responseSchema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      speakers: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            name: { type: 'STRING' },
          },
          required: ['id', 'name'],
        },
      },
      lines: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            speakerId: { type: 'STRING' },
            text: { type: 'STRING' },
          },
          required: ['speakerId', 'text'],
        },
      },
    },
    required: ['title', 'speakers', 'lines'],
  };

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `Scene/topic: ${topic}` }] },
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.8,
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini Server] Script generation error:', response.status, errorText);

      let reason = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.error?.message) reason = parsed.error.message;
      } catch {
        // 응답이 JSON이 아니면 원문 그대로 사용
      }

      return new Response(
        JSON.stringify({ error: `Gemini API error ${response.status}: ${reason}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Empty response from AI' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let script;
    try {
      script = JSON.parse(content);
    } catch {
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (
      !script?.title ||
      !Array.isArray(script?.speakers) ||
      !Array.isArray(script?.lines) ||
      script.lines.length === 0
    ) {
      return new Response(JSON.stringify({ error: 'AI returned an unexpected script shape' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(script), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Script generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
