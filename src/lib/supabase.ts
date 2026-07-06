import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const customFetch = async (...args: any[]) => {
  try {
    return await fetch(...(args as [RequestInfo, RequestInit?]));
  } catch (error: any) {
    // Treat any error during fetch as an offline/network error to avoid throwing objects that crash the app
    return new Response(JSON.stringify({ error: 'offline', message: 'Failed to fetch' }), {
      status: 502,
      statusText: 'Bad Gateway',
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch
  }
});
