'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import type { ChatMessage, DomainSuggestion } from '@/types/index';

interface ChatWindowProps {
  messages: ChatMessage[];
  suggestions: (DomainSuggestion & { available?: boolean })[];
  loading: boolean;
  onSend: (message: string) => void;
}

export function ChatWindow({ messages, suggestions, loading, onSend }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const conversationStarters = [
    "I need a domain for my AI startup",
    "Help me find domains for an e-commerce platform",
    "What's a good domain for a tech blog?",
    "I'm building a fitness app, any domain ideas?"
  ];

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800">
                  <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    <Bot className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Deep Minds AI! 🚀
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                I&apos;m here to help you find the perfect domain name for your project. Just describe your idea and I&apos;ll suggest some creative options!
              </p>
            </div>
            
            {/* Conversation Starters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conversationStarters.map((starter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md"
                  onClick={() => setInput(starter)}
                >
                  <span className="text-sm">{starter}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 flex-shrink-0">
                <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <div
              className={`max-w-[75%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <Avatar className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Domain Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex gap-4">
              <Avatar className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 flex-shrink-0">
                <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Here are some domain suggestions for you:
                </h4>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-blue-600 dark:text-blue-400">
                            {suggestion.domain}
                          </h5>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              suggestion.available === true 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : suggestion.available === false 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {suggestion.available === true 
                              ? '✅ Available' 
                              : suggestion.available === false 
                              ? '❌ Taken' 
                              : '🔍 Checking...'}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {suggestion.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-4 animate-fade-in-up">
            <Avatar className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 flex-shrink-0">
              <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your project or ask about domain names..."
              className="min-h-[44px] max-h-32 resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

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