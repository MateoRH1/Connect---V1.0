import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  db: {
    schema: 'public'
  }
});

// Test the connection and return status
export async function testConnection() {
  try {
    // First check if we can connect
    const { data: { session } } = await supabase.auth.getSession();
    
    // Then check if we can query the users table
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Database connection error:', error);
      return {
        status: 'error',
        error: error.message,
        userCount: 0
      };
    }

    return {
      status: 'connected',
      userCount: count || 0,
      data
    };
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return {
      status: 'error',
      error: error.message,
      userCount: 0
    };
  }
}
