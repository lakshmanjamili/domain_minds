import type { DomainSuggestion } from '@/types/index';
import { NUM_SUGGESTIONS } from './config';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// To use GPT-4 or OpenAI, change the endpoint and model below.
const MODEL = 'meta-llama/llama-3-8b-instruct';

export async function getDomainSuggestions(description: string): Promise<DomainSuggestion[]> {
  const prompt = `You are a world-class creative branding assistant. Your job is to suggest ${NUM_SUGGESTIONS} unique, catchy, and brandable .com domain names for the following project or idea. Avoid generic or overused words, and make sure each name is short, memorable, and easy to spell. For each, provide a one-sentence explanation of why it fits. Respond ONLY in this format (no extra text):\n${Array.from({length: NUM_SUGGESTIONS}, (_, i) => `${i+1}. domain.com - explanation`).join('\n')}\n\nProject: ${description}`;
  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a creative domain name generator.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.9,
    }),
  });
  if (!res.ok) throw new Error('LLM API error');
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  console.log('LLM raw output:', text); // Debug: see what the LLM returns
  // Parse the LLM output into DomainSuggestion[]
  return text.split(/\n|\r/)
    .map((line: string) => line.trim())
    .filter(Boolean)
    .map((line: string) => {
      const match = line.match(/^(?:\d+\.\s*)?([\w-]+\.[a-z]{2,})\s*-\s*(.+)$/i);
      if (match) {
        return { domain: match[1], explanation: match[2] };
      }
      return null;
    })
    .filter(Boolean) as DomainSuggestion[];
} 