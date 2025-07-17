import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TODO: Add Supabase client here for chat/session storage
// export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!); 