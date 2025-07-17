import { NextRequest, NextResponse } from 'next/server';
import { getDomainSuggestions } from '@/lib/openrouter';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const authResult = await auth();
  console.log('Clerk auth() result:', authResult);
  const { userId } = authResult;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { description, conversationId } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid description.' }, { status: 400 });
    }

    // Log user message to Supabase
    if (conversationId) {
      await supabase.from('messages').insert([
        {
          conversation_id: conversationId,
          role: 'user',
          content: description,
        }
      ]);
    }

    const suggestions = await getDomainSuggestions(description);

    // Log suggestions to Supabase
    if (conversationId) {
      await supabase.from('domain_suggestions').insert(
        suggestions.map(s => ({
          conversation_id: conversationId,
          domain: s.domain,
          explanation: s.explanation,
          available: null, // You can update this after checking availability
        }))
      );
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get suggestions.' }, { status: 500 });
  }
} 