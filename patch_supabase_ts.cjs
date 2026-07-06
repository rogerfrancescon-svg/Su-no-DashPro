const fs = require('fs');
let code = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';

const customFetch = async (...args: any[]) => {
  try {
    return await fetch(...(args as [RequestInfo, RequestInit?]));
  } catch (error: any) {
    if (String(error).includes('fetch') || (error.message && error.message.includes('fetch')) || error.name === 'TypeError') {
      return new Response(JSON.stringify({ error: 'offline', message: 'Failed to fetch' }), {
        status: 502,
        statusText: 'Bad Gateway',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch
  }
});
`;
fs.writeFileSync('src/lib/supabase.ts', code);
