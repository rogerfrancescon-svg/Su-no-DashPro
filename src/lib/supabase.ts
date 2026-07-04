import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';

export const supabase = createClient(supabaseUrl, supabaseKey);
