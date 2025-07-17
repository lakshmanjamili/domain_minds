import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  console.log('Clerk userId:', userId);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Upsert user into users table
  await supabase.from('users').upsert([{ id: userId }]);

  const { name } = await req.json();
  console.log('Creating conversation with name:', name);

  const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_id: userId, name }])
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ conversation: data });
} 