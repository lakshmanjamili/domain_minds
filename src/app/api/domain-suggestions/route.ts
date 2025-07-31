import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // For now, return empty suggestions since we're managing them in memory
    // In the future, we could store domain suggestions in Supabase and fetch them here
    return NextResponse.json({ 
      suggestions: [],
      message: 'Domain suggestions are currently managed in memory'
    });

  } catch (error) {
    console.error('Error fetching domain suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain suggestions' }, 
      { status: 500 }
    );
  }
} 