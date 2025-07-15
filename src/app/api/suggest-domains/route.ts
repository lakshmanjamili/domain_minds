import { NextRequest, NextResponse } from 'next/server';
import { getDomainSuggestions } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid description.' }, { status: 400 });
    }
    const suggestions = await getDomainSuggestions(description);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get suggestions.' }, { status: 500 });
  }
} 