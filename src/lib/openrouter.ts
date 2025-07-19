import type { DomainSuggestion, ChatMessage } from '@/types/index';
import { NUM_SUGGESTIONS } from './config';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3-8b-instruct';

export type ConversationalResponse = {
  assistantReply: string;
  domainSuggestions: DomainSuggestion[];
  intent: 'greeting' | 'domain_request' | 'general_chat' | 'project_discussion' | 'goodbye';
  needsMoreInfo?: boolean;
};

export async function getConversationalResponse(
  userMessage: string,
  chatHistory: ChatMessage[] = []
): Promise<ConversationalResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('OpenRouter API Key status:', apiKey ? 'Present' : 'Missing');
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing. Please set OPENROUTER_API_KEY in your environment variables.');
  }

  const messages = [
    {
      role: 'system' as const,
      content: `You are DomainMind, an intelligent and conversational AI assistant specialized in domain name suggestions and business insights. You have a friendly, professional personality and can engage in natural conversations while helping users find perfect domain names.

Your core capabilities:
- Generate creative, brandable domain suggestions
- Analyze business ideas and suggest relevant domains
- Provide domain availability insights
- Engage in natural conversation with context awareness
- Detect user intent and respond appropriately

Response format: Always respond with a JSON object containing:
{
  "intent": "domain_search" | "conversation" | "clarification",
  "reply": "Your conversational response to the user",
  "domains": ["domain1.com", "domain2.com"] (only if intent is domain_search),
  "needsMoreInfo": boolean
}

Guidelines:
- Be conversational and helpful
- If the user asks about domains, generate 3-5 relevant suggestions
- For general conversation, engage naturally while steering toward domain topics
- If you need more information about their business/idea, ask follow-up questions
- Remember the conversation context and refer to previous messages when relevant`
    },
    ...chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user' as const,
      content: userMessage
    }
  ];

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'DomainMind Chat'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      apiKey: apiKey ? 'Present' : 'Missing',
      headers: response.headers
    });
    throw new Error(`LLM API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  console.log('LLM raw output:', text);

  return parseConversationalResponse(text, userMessage);
}

function parseConversationalResponse(text: string, userMessage: string): ConversationalResponse {
  try {
    // Try to parse as JSON first (new format)
    const jsonResponse = JSON.parse(text);
    
    let intent: ConversationalResponse['intent'] = 'general_chat';
    
    // Map the JSON intent to our intent types
    if (jsonResponse.intent) {
      const aiIntent = jsonResponse.intent.toLowerCase();
      if (aiIntent === 'domain_search') {
        intent = 'domain_request';
      } else if (aiIntent === 'conversation') {
        intent = 'general_chat';
      } else if (aiIntent === 'clarification') {
        intent = 'project_discussion';
      } else if (['greeting', 'domain_request', 'general_chat', 'project_discussion', 'goodbye'].includes(aiIntent)) {
        intent = aiIntent as ConversationalResponse['intent'];
      }
    }
    
    // Get reply
    const assistantReply = jsonResponse.reply || getDefaultReply(intent, userMessage);
    
    // Parse domains
    let domainSuggestions: DomainSuggestion[] = [];
    if (jsonResponse.domains && Array.isArray(jsonResponse.domains)) {
      domainSuggestions = jsonResponse.domains.map((domain: string) => ({
        domain: domain,
        explanation: `Great choice for your project - ${domain} is brandable and memorable.`
      }));
    }
    
    // Get needsMoreInfo
    const needsMoreInfo = jsonResponse.needsMoreInfo === true;
    
    return {
      assistantReply,
      domainSuggestions,
      intent,
      needsMoreInfo
    };
  } catch (error) {
    // Fallback to simple domain generation
    console.log('Failed to parse JSON, using fallback domain generation:', error);
    return {
      assistantReply: getDefaultReply('domain_request', userMessage),
      domainSuggestions: [],
      intent: 'domain_request',
      needsMoreInfo: false
    };
  }
}

function getDefaultReply(intent: ConversationalResponse['intent'], userMessage: string): string {
  switch (intent) {
    case 'greeting':
      return "Hi there! 👋 I'm Deep Minds AI, your friendly domain name expert. I love helping entrepreneurs find perfect domain names for their projects! What are you working on?";
    case 'domain_request':
      return "I'd be happy to help you find some great domain names! Tell me more about your project so I can suggest the most relevant options.";
    case 'project_discussion':
      return "That sounds interesting! I'd love to learn more about your project. Can you tell me what makes it special and what kind of audience you're targeting?";
    case 'goodbye':
      return "Thanks for chatting with me! Feel free to come back anytime you need help with domain names or want to brainstorm your next big idea. Good luck with your project! 🚀";
    default:
      return `I understand! Let me know if you'd like help finding domain names for any projects you're working on. I'm here to help make your ideas come to life with the perfect domain! ✨ (Based on: "${userMessage}")`;
  }
}

// Keep the old function for backward compatibility
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
  console.log('LLM raw output:', text);
  
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