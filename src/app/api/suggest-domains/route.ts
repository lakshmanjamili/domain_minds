import { NextRequest, NextResponse } from 'next/server';
import { getConversationalResponse } from '@/lib/openrouter';
import { checkDomainAvailabilityWithGoDaddy } from '@/lib/godaddy';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import type { DomainWithStatus } from '@/types/index';

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

    console.log('🤖 Agent 1: Starting LLM domain generation for:', description);

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

    // 🤖 Agent 1: Get conversational AI response with enhanced domain suggestions
    const { assistantReply, domainSuggestions, intent, needsMoreInfo } = await getConversationalResponse(
      description,
      conversationHistory
    );

    console.log('🤖 Agent 1 Complete: Generated', domainSuggestions.length, 'domain suggestions');
    console.log('🔍 Agent 2: Starting real-time availability check...');

    // 🔍 Agent 2: Check domain availability using GoDaddy API/DNS
    let domainsWithStatus: DomainWithStatus[] = [];
    
    if (domainSuggestions.length > 0) {
      const domainNames = domainSuggestions.map(d => d.domain);
      const availabilityResults = await checkDomainAvailabilityWithGoDaddy(domainNames);
      
      // Combine LLM suggestions with GoDaddy availability data
      domainsWithStatus = domainSuggestions.map((suggestion, index) => {
        const availability = availabilityResults[index];
        return {
          ...suggestion,
          status: availability?.status || 'unknown',
          registerURL: availability?.registerURL,
          price: availability?.price ? `$${availability.price}` : undefined,
          currency: availability?.currency,
          summary: availability?.summary
        } as DomainWithStatus;
      });

      console.log('🔍 Agent 2 Complete: GoDaddy availability check for', domainsWithStatus.length, 'domains');
    }

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

    // Store domain suggestions with availability status
    if (domainsWithStatus.length > 0) {
      const { error: suggestionsError } = await supabase
        .from('domain_suggestions')
        .insert(
          domainsWithStatus.map(domain => ({
            conversation_id: conversationId,
            user_id: userId,
            domain: domain.domain,
            explanation: domain.explanation,
            available: domain.status === 'available',
          }))
        );

      if (suggestionsError) {
        console.error('Error storing domain suggestions:', suggestionsError);
      }

      // Track token usage for enhanced AI + API calls
      await supabase
        .from('token_usage')
        .insert([{
          user_id: userId,
          tokens_used: 1000, // Higher estimate for enhanced AI + API calls
          api_call_type: 'agentic_domain_suggestion_with_availability',
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

    console.log('🎨 Agent 3: Preparing results for UI rendering...');
    console.log('✅ Agentic workflow complete! Returning', domainsWithStatus.length, 'domains with status');

    return NextResponse.json({ 
      assistantReply,
      domainSuggestions: domainsWithStatus,
      intent,
      needsMoreInfo,
      userMessage,
      assistantMessage,
      agenticWorkflowComplete: true
    });
  } catch {
    console.error('Error in agentic suggest-domains workflow');
    return NextResponse.json({ error: 'Failed to complete agentic domain suggestion workflow.' }, { status: 500 });
  }
} 