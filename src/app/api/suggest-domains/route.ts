import { NextRequest, NextResponse } from 'next/server';
import { getConversationalResponse } from '@/lib/openrouter';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { description, conversationId } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid description.' }, { status: 400 });
    }

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId.' }, { status: 400 });
    }

    // Get conversation history from Supabase (last 10 messages for context)
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (messagesError) {
      console.error('Error fetching conversation history:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch conversation history.' }, { status: 500 });
    }

    const conversationHistory = messagesData || [];

    // Store the user's message first
    const { data: userMessage, error: userMessageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        role: 'user',
        content: description,
      }])
      .select()
      .single();

    if (userMessageError) {
      console.error('Error storing user message:', userMessageError);
      return NextResponse.json({ error: 'Failed to store user message.' }, { status: 500 });
    }

    // Get conversational AI response with context
    const { assistantReply, domainSuggestions, intent, needsMoreInfo } = await getConversationalResponse(
      description,
      conversationHistory
    );

    console.log('AI Response:', { intent, needsMoreInfo, domainCount: domainSuggestions.length });

    // Store the assistant's conversational response
    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantReply,
      }])
      .select()
      .single();

    if (assistantMessageError) {
      console.error('Error storing assistant message:', assistantMessageError);
      return NextResponse.json({ error: 'Failed to store assistant message.' }, { status: 500 });
    }

    // Store domain suggestions if any were generated
    if (domainSuggestions.length > 0) {
      const { error: suggestionsError } = await supabase
        .from('domain_suggestions')
        .insert(
          domainSuggestions.map(suggestion => ({
            conversation_id: conversationId,
            user_id: userId,
            domain: suggestion.domain,
            explanation: suggestion.explanation,
          }))
        );

      if (suggestionsError) {
        console.error('Error storing domain suggestions:', suggestionsError);
      }

      // Track token usage
      await supabase
        .from('token_usage')
        .insert([{
          user_id: userId,
          tokens_used: 800, // Estimate for conversational AI
          api_call_type: 'conversational_domain_suggestion',
        }]);
    }

    // Update conversation name if this is likely the first meaningful message
    if (intent === 'domain_request' || intent === 'project_discussion') {
      const conversationName = description.length > 50 ? description.substring(0, 50) + '...' : description;
      await supabase
        .from('conversations')
        .update({ name: conversationName })
        .eq('id', conversationId);
    }

    return NextResponse.json({ 
      assistantReply,
      domainSuggestions,
      intent,
      needsMoreInfo,
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error('Error in suggest-domains:', error);
    return NextResponse.json({ error: 'Failed to generate conversational response.' }, { status: 500 });
  }
} 