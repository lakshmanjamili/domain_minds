import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid domain.' }, { status: 400 });
    }
    // Stub: always available. Replace with real API call if needed.
    return NextResponse.json({ domain, available: true });
  } catch {
    return NextResponse.json({ error: 'Failed to check domain.' }, { status: 500 });
  }
} 