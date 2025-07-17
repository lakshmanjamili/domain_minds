import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversationId = req.nextUrl.searchParams.get('conversationId');
  if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId, role, content } = await req.json();
  if (!conversationId || !role || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conversationId, role, content }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
} 