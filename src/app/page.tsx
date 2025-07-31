"use client";
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatWindow } from '@/components/ChatWindow';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import type { ChatMessage, DomainWithStatus } from '@/types/index';
import toast, { Toaster } from 'react-hot-toast';

// Conversation type for Supabase
export type Conversation = {
  id: string;
  name: string;
  created_at?: string;
  user_id?: string;
};

// Enhanced message type that can include domain suggestions
export type ConversationItem = {
  type: 'message' | 'domains';
  data: ChatMessage | DomainWithStatus[];
  id: string;
  conversation_id?: string;
};

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<DomainWithStatus[]>([]);
  // New state to track all conversation items (messages + domain suggestions)
  const [conversationHistory, setConversationHistory] = useState<{
    messages: ChatMessage[];
    domainSuggestions: Array<{
      id: string;
      suggestions: DomainWithStatus[];
      messageIndex: number;
    }>;
  }>({
    messages: [],
    domainSuggestions: []
  });
  const { isSignedIn, user } = useUser();
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory.messages]);

  // Fetch conversations from Supabase on load
  useEffect(() => {
    if (!isSignedIn) {
      setConversations([]);
      setActiveId(null);
      setMessages([]);
      setSuggestions([]);
      setConversationHistory({ messages: [], domainSuggestions: [] });
      return;
    }
    
    setMessagesLoading(true);
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations && data.conversations.length > 0) {
          setConversations(data.conversations);
          setActiveId(data.conversations[0].id);
        } else {
          setConversations([]);
          setActiveId(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      })
      .finally(() => {
        setMessagesLoading(false);
      });
  }, [isSignedIn]);

  // Fetch messages for the active conversation
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setSuggestions([]);
      setConversationHistory({ messages: [], domainSuggestions: [] });
      return;
    }
    
    setMessagesLoading(true);
    Promise.all([
      fetch(`/api/messages?conversationId=${activeId}`).then(res => res.json()),
      fetch(`/api/domain-suggestions?conversationId=${activeId}`).then(res => res.json()).catch(() => ({ suggestions: [] }))
    ])
      .then(([messagesData, suggestionsData]) => {
        const fetchedMessages = messagesData.messages || [];
        const fetchedSuggestions = suggestionsData.suggestions || [];
        
        setMessages(fetchedMessages);
        setSuggestions([]); // Clear current suggestions
        
        // Build conversation history with proper ordering
        const domainSuggestionGroups = fetchedSuggestions.reduce((acc: any[], suggestion: any) => {
          const messageIndex = fetchedMessages.findIndex((msg: ChatMessage) => 
            msg.id && suggestion.message_id === msg.id
          );
          
          if (messageIndex !== -1) {
            const existingGroup = acc.find(group => group.messageIndex === messageIndex);
            if (existingGroup) {
              existingGroup.suggestions.push(suggestion);
            } else {
              acc.push({
                id: `suggestions-${messageIndex}`,
                suggestions: [suggestion],
                messageIndex: messageIndex + 1 // After the assistant response
              });
            }
          }
          return acc;
        }, []);
        
        setConversationHistory({
          messages: fetchedMessages,
          domainSuggestions: domainSuggestionGroups
        });
      })
      .catch((error) => {
        console.error('Error fetching conversation data:', error);
        toast.error('Failed to load conversation');
      })
      .finally(() => {
        setMessagesLoading(false);
      });
  }, [activeId]);

  const handleSend = async (message: string) => {
    if (!isSignedIn) {
      if (guestMessageCount >= 5) {
        toast.error('Sign in to continue chatting and save your conversations!');
        return;
      }
      setGuestMessageCount((c) => c + 1);
    }

    if (!activeId && isSignedIn) {
      // Create new conversation first
      await handleNewConvo();
      return;
    }

    setLoading(true);
    // Don't clear suggestions anymore - let them persist
    // setSuggestions([]);

    // Add user message optimistically
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      conversation_id: activeId || undefined
    };
    
    // Update conversation history
    setConversationHistory(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call the API route which handles the OpenRouter integration
      const response = await fetch('/api/suggest-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: message,
          conversationId: activeId
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Replace optimistic user message with stored message
      if (data.userMessage) {
        setConversationHistory(prev => ({
          ...prev,
          messages: prev.messages.map((msg, idx) => 
            idx === prev.messages.length - 1 ? data.userMessage : msg
          )
        }));
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 ? data.userMessage : msg
        ));
      }

      // Add assistant message
      let assistantMessage: ChatMessage;
      if (data.assistantMessage) {
        assistantMessage = data.assistantMessage;
      } else if (data.assistantReply) {
        // Fallback if message wasn't stored
        assistantMessage = {
          role: 'assistant',
          content: data.assistantReply,
          conversation_id: activeId || undefined
        };
      }

      if (assistantMessage!) {
        setConversationHistory(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage]
        }));
        setMessages(prev => [...prev, assistantMessage]);
      }

      // Handle domain suggestions - ADD them to conversation history instead of replacing
      if (data.domainSuggestions && data.domainSuggestions.length > 0) {
        const newSuggestionGroup = {
          id: `suggestions-${Date.now()}`,
          suggestions: data.domainSuggestions,
          messageIndex: conversationHistory.messages.length + 1 // After the new assistant message
        };
        
        setConversationHistory(prev => ({
          ...prev,
          domainSuggestions: [...prev.domainSuggestions, newSuggestionGroup]
        }));
        
        // Also update the current suggestions for the ChatWindow component
        setSuggestions(data.domainSuggestions);
        
        // Show success message with count
        const availableCount = data.domainSuggestions.filter((d: DomainWithStatus) => d.status === 'available').length;
        if (availableCount > 0) {
          toast.success(`Found ${availableCount} available domains! Check the green ones below.`);
        } else {
          toast.success('Domain suggestions generated with availability status!');
        }
      }

      // Update conversation name if it's the first message
      if (conversationHistory.messages.length === 0 && isSignedIn && activeId && data.intent === 'domain_request') {
        const conversationName = message.length > 50 ? message.substring(0, 50) + '...' : message;
        setConversations(prev => prev.map(conv => 
          conv.id === activeId ? { ...conv, name: conversationName } : conv
        ));
      }

      toast.success('Response generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate response. Please try again.');
      
      // Remove optimistic messages on error
      setConversationHistory(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1)
      }));
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewConvo = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to create conversations');
      return;
    }

    const name = `New Conversation ${conversations.length + 1}`;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.conversation) {
        setConversations([data.conversation, ...conversations]);
        setActiveId(data.conversation.id);
        setMessages([]);
        setSuggestions([]);
        setConversationHistory({ messages: [], domainSuggestions: [] });
        toast.success('New conversation created!');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const handleDeleteConvo = async (id: string) => {
    try {
      const newConvos = conversations.filter((c) => c.id !== id);
    setConversations(newConvos);
    if (activeId === id) {
      setActiveId(newConvos[0]?.id || null);
        setMessages([]);
        setSuggestions([]);
        setConversationHistory({ messages: [], domainSuggestions: [] });
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-gradient-to-br from-gray-900/95 to-blue-900/90 border-r border-blue-100 dark:border-gray-800 p-0 flex flex-col min-h-[60vh] lg:min-h-screen shadow-2xl z-10 backdrop-blur-xl lg:rounded-tr-3xl lg:rounded-br-3xl transition-all duration-300">
        {/* Header with Welcome Message */}
        <div className="p-6 border-b border-blue-800/40">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-blue-400 text-lg" />
            <span className="text-blue-200 text-sm font-medium">
              {isSignedIn ? `Welcome back, ${user?.firstName || 'User'}!` : 'Welcome to Deep Minds'}
            </span>
          </div>
          
          <Button 
            onClick={handleNewConvo} 
            disabled={!isSignedIn} 
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 py-3 text-base group"
          >
            <Plus className="text-lg group-hover:rotate-90 transition-transform duration-200" />
            <span>New Conversation</span>
          </Button>
          
          {!isSignedIn && (
            <p className="text-xs text-blue-200/80 text-center mt-3">
              Sign in to save conversations & get unlimited access
            </p>
          )}
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
          {messagesLoading ? (
            <div className="text-center text-blue-200 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-2"></div>
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-blue-200/60 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet.</p>
              <p className="text-xs mt-1">Start a new chat to begin!</p>
          </div>
          ) : (
            conversations.map(c => (
              <Card
                key={c.id}
                className={`mb-3 p-4 cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${
                  c.id === activeId 
                    ? 'border-blue-400 bg-blue-50/90 dark:bg-blue-950/90 shadow-xl scale-[1.02]' 
                    : 'border-transparent bg-white/10 dark:bg-gray-800/30 hover:border-blue-300 hover:bg-blue-100/20'
                }`}
                onClick={() => setActiveId(c.id)}
                style={{ borderRadius: '1rem' }}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate flex-1 font-medium text-gray-800 dark:text-gray-200 text-sm">
                    {c.name}
                  </span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200" 
                    onClick={e => { 
                      e.stopPropagation(); 
                      handleDeleteConvo(c.id); 
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                </Button>
                </div>
              </Card>
            ))
          )}
          </div>
        </aside>

        {/* Main Chat Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent drop-shadow-xl mb-6 animate-fade-in-up">
              Domain Minds AI Agent
            </h1>
            <p className="max-w-3xl mx-auto text-lg lg:text-xl text-gray-700 dark:text-gray-200 font-medium drop-shadow-sm animate-fade-in-up" style={{animationDelay: '200ms'}}>
              Your AI-powered creative partner for finding the perfect, brandable .com domain names. 
              Describe your project or idea and let our assistant suggest unique, memorable names instantly checked for availability.
            </p>
          </div>

          {isSignedIn && activeId ? (
              <ChatWindow
              messages={messages}
              suggestions={suggestions}
                loading={loading}
                onSend={handleSend}
                conversationHistory={conversationHistory}
              />
          ) : !isSignedIn ? (
            <div className="text-center text-lg text-gray-500 dark:text-gray-400 mt-12 animate-fade-in-up bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl" style={{animationDelay: '400ms'}}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-3xl">🔐</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Welcome to Deep Minds!
                  </h3>
                  <p>Please sign in to start chatting and saving your conversations.</p>
                  <p className="text-sm mt-2 text-gray-400">
                    You can also try as a guest with up to 5 messages.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-lg text-gray-500 dark:text-gray-400 mt-12 animate-fade-in-up bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl" style={{animationDelay: '400ms'}}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-3xl">💬</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Ready to Chat!
                  </h3>
                  <p>Select a conversation or create a new one to start.</p>
                </div>
              </div>
            </div>
            )}
          </div>
        </main>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      </div>
  );
}
