export type DomainSuggestion = {
  domain: string;
  explanation: string;
};

export type ChatMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  conversation_id?: string;
}; 