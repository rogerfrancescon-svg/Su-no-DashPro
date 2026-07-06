const fs = require('fs');
let code = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';

const customFetch = async (...args) => {
  try {
    return await fetch(...args);
  } catch (error) {
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

let mainCode = fs.readFileSync('src/main.tsx', 'utf8');
mainCode = mainCode.replace(/const originalFetch = window\.fetch;[\s\S]*?import App from '\.\/App\.tsx';/, "import App from './App.tsx';");
fs.writeFileSync('src/main.tsx', mainCode);
