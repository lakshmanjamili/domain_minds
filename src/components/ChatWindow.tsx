import React from 'react';
import { ChatInput } from './ChatInput';
import { DomainSuggestion } from './DomainSuggestion';
import type { DomainSuggestion as DomainSuggestionType } from '@/types/index';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  messages: ChatMessage[];
  suggestions: (DomainSuggestionType & { available?: boolean })[];
  loading: boolean;
  onSend: (message: string) => void;
};

const userAvatar = (
  <Avatar>
    <AvatarImage src="/user-avatar.png" alt="User" />
    <AvatarFallback>U</AvatarFallback>
  </Avatar>
);
const aiAvatar = (
  <Avatar>
    <AvatarImage src="/ai-avatar.png" alt="AI" />
    <AvatarFallback>AI</AvatarFallback>
  </Avatar>
);

export const ChatWindow: React.FC<Props> = ({ messages, suggestions, loading, onSend }) => (
  <div className="flex flex-col h-full max-h-[90vh] w-full max-w-2xl mx-auto">
    <div className="relative">
      <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-blue-400/30 via-white/20 to-purple-300/30 blur-2xl opacity-80" />
      <Card className="relative z-10 flex-1 flex flex-col overflow-hidden rounded-3xl border-0 shadow-2xl bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg ring-1 ring-blue-200/40 dark:ring-gray-800/60 animate-fade-in-up">
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-4 items-end transition-all duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {msg.role === 'assistant' && aiAvatar}
              <div
                className={`rounded-2xl px-6 py-4 shadow-lg text-base max-w-[75%] transition-all duration-200 ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white rounded-br-none hover:scale-[1.03]'
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-bl-none border border-blue-100 dark:border-gray-800 hover:scale-[1.03]'}`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && userAvatar}
            </div>
          ))}
          {suggestions.length > 0 && (
            <>
              <Separator className="my-8" />
              <div className="space-y-4">
                <div className="font-bold text-gray-700 dark:text-gray-200 text-xl mb-2 tracking-tight drop-shadow">Domain Suggestions</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {suggestions.map((s, i) => (
                    <DomainSuggestion key={s.domain + i} {...s} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="border-t bg-gradient-to-r from-blue-100/60 via-white/80 to-purple-100/60 dark:from-gray-900/80 dark:via-gray-950/80 dark:to-gray-900/80 p-6 shadow-xl rounded-b-3xl">
          <ChatInput onSend={onSend} loading={loading} />
        </div>
      </Card>
    </div>
  </div>
);

// Animations (add to globals.css or tailwind config)
// .animate-fade-in-up {
//   @apply opacity-0 translate-y-4;
//   animation: fadeInUp 0.5s forwards;
// }
// @keyframes fadeInUp {
//   to {
//     opacity: 1;
//     transform: none;
//   }
// } 