import { supabase } from '@/supabaseClient';

export interface GeneratedScript {
  title: string;
  speakers: { id: string; name: string }[];
  lines: { speakerId: string; text: string }[];
}

export async function generateScript(
  topic: string,
  lineCount = 10,
): Promise<GeneratedScript> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('User is not authenticated');
  }

  const response = await fetch('/api/generate-script', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, lineCount }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[API Proxy] Error:', response.status, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
