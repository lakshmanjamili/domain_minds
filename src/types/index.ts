export type DomainSuggestion = {
  domain: string;
  explanation: string;
  relevanceScore?: number; // How well it matches user intent (1-10)
  category?: string; // e.g., "brandable", "descriptive", "keyword-rich"
  reasoning?: string; // Why this domain fits the user's needs
};

export type DomainWithStatus = DomainSuggestion & {
  status: 'available' | 'taken' | 'unknown' | 'checking';
  registerURL?: string;
  price?: string;
  currency?: string;
  summary?: string;
};

export type ChatMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  conversation_id?: string;
}; 