"use client";
import React, { useState, useEffect } from "react";
import { ChatWindow, ChatMessage } from "@/components/ChatWindow";
import type { DomainSuggestion } from "@/types/index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useUser, SignInButton, UserButton, SignOutButton } from "@clerk/nextjs";

// Conversation type for Supabase
export type Conversation = {
  id: string;
  name: string;
  created_at?: string;
  user_id?: string;
};

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newConvoName, setNewConvoName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<(DomainSuggestion & { available?: boolean })[]>([]);
  const { isSignedIn } = useUser();

  // Fetch conversations from Supabase on load
  useEffect(() => {
    if (!isSignedIn) {
      setConversations([]);
      setActiveId(null);
      setMessages([]);
      setSuggestions([]);
      return;
    }
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
      });
  }, [isSignedIn]);

  // Fetch messages for the active conversation
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setSuggestions([]);
      return;
    }
    fetch(`/api/messages?conversationId=${activeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
        setSuggestions([]);
      });
  }, [activeId]);

  const handleSend = async (message: string) => {
    if (!activeId) return;
    setLoading(true);
    // Add user message to DB
    const resMsg = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, role: "user", content: message }),
    });
    const msgData = await resMsg.json();
    if (msgData.message) {
      setMessages((prev) => [...prev, msgData.message]);
    }
    // Get suggestions from LLM
    try {
      const res = await fetch("/api/suggest-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: message, conversationId: activeId }),
      });
      const data = await res.json();
      if (data.suggestions) {
        // Add assistant message to DB
        const resMsg2 = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: activeId, role: "assistant", content: "Here are some domain ideas for you:" }),
        });
        const msgData2 = await resMsg2.json();
        if (msgData2.message) {
          setMessages((prev) => [...prev, msgData2.message]);
        }
        // Check domain availability for each suggestion
        const checked = await Promise.all(
          data.suggestions.map(async (s: DomainSuggestion) => {
            try {
              const r = await fetch("/api/check-domain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: s.domain }),
              });
              const d = await r.json();
              return { ...s, available: d.available };
            } catch {
              return { ...s, available: undefined };
            }
          })
        );
        setSuggestions(checked);
      } else {
        // Add error message to DB
        const resMsg2 = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: activeId, role: "assistant", content: "Sorry, I could not generate suggestions." }),
        });
        const msgData2 = await resMsg2.json();
        if (msgData2.message) {
          setMessages((prev) => [...prev, msgData2.message]);
        }
      }
    } catch {
      // Add error message to DB
      const resMsg2 = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, role: "assistant", content: "Sorry, something went wrong." }),
      });
      const msgData2 = await resMsg2.json();
      if (msgData2.message) {
        setMessages((prev) => [...prev, msgData2.message]);
      }
    }
    setLoading(false);
  };

  const handleNewConvo = async () => {
    const name = newConvoName.trim() || `Conversation ${conversations.length + 1}`;
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.conversation) {
      setConversations([data.conversation, ...conversations]);
      setActiveId(data.conversation.id);
      setNewConvoName("");
      setMessages([]);
      setSuggestions([]);
    }
  };

  const handleDeleteConvo = (id: string) => {
    // Optional: implement delete API and update state
    const newConvos = conversations.filter((c) => c.id !== id);
    setConversations(newConvos);
    if (activeId === id) {
      setActiveId(newConvos[0]?.id || null);
      setMessages([]);
      setSuggestions([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white/80 dark:bg-gray-900/80 border-r border-blue-100 dark:border-gray-800 p-6 flex flex-col gap-6 min-h-[60vh] shadow-xl z-10">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/ai-avatar.png" alt="AI Agent" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <Link href="/" className="font-bold text-lg bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent hover:underline focus:underline outline-none">Domain Minds</Link>
          </div>
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/" />
              <SignOutButton>
                <Button variant="outline" className="ml-2">Sign Out</Button>
              </SignOutButton>
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button className="rounded-full mt-1 bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 text-white font-bold shadow hover:scale-105">
                Sign In
              </Button>
            </SignInButton>
          )}
          <Input
            placeholder="New conversation name..."
            value={newConvoName}
            onChange={e => setNewConvoName(e.target.value)}
            className="rounded-full px-4 py-2 text-sm"
            onKeyDown={e => { if (e.key === 'Enter') handleNewConvo(); }}
            disabled={!isSignedIn}
          />
          <Button className="rounded-full mt-1 bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 text-white font-bold shadow hover:scale-105" onClick={handleNewConvo} disabled={!isSignedIn}>
            + New Conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => (
            <Card
              key={c.id}
              className={`mb-3 p-3 flex items-center gap-2 cursor-pointer border-2 transition-all ${c.id === activeId ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-transparent hover:border-blue-300 hover:bg-blue-100/40 dark:hover:bg-blue-900/40'}`}
              onClick={() => setActiveId(c.id)}
            >
              <span className="truncate flex-1 font-medium text-gray-800 dark:text-gray-200">{c.name}</span>
              <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900" onClick={e => { e.stopPropagation(); handleDeleteConvo(c.id); }}>
                ×
              </Button>
            </Card>
          ))}
        </div>
        <div className="mt-auto pt-8 text-xs text-gray-500 dark:text-gray-400 text-left">
          © {new Date().getFullYear()} Loukri AI. All rights reserved.
        </div>
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent drop-shadow mb-4 text-center">Domain Minds AI Agent</h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-8 font-medium drop-shadow-sm text-center">
            Your AI-powered creative partner for finding the perfect, brandable .com domain names. Describe your project or idea and let our assistant suggest unique, memorable names instantly checked for availability.
          </p>
          {isSignedIn && activeId && (
            <ChatWindow
              messages={messages}
              suggestions={suggestions}
              loading={loading}
              onSend={handleSend}
            />
          )}
          {!isSignedIn && (
            <div className="text-center text-lg text-gray-500 dark:text-gray-400 mt-8">
              Please sign in to start chatting and saving your conversations.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
