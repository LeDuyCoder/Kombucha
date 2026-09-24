import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isUrlValid = Boolean(
  supabaseUrl &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder')
);

const isKeyValid = Boolean(
  supabaseAnonKey &&
  !supabaseAnonKey.includes('your-anon-key') &&
  !supabaseAnonKey.includes('placeholder')
);

export const isSupabaseConfigured = isUrlValid && isKeyValid;

// Safe URL fallback for createClient singleton
const safeUrl = (supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')))
  ? supabaseUrl
  : 'https://placeholder-project.supabase.co';

const safeKey = supabaseAnonKey || 'placeholder-anon-key-safe-fallback-12345';

// Create Supabase client singleton
export const supabase = createClient(safeUrl, safeKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
