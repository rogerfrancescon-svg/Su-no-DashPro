import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing integrados table...');
  const { data: integrados, error: err1 } = await supabase.from('integrados').select('*').limit(1);
  if (err1) {
    console.error('Error fetching integrados:', err1.message);
  } else {
    console.log('Integrados table is accessible!');
  }

  console.log('Testing visits table...');
  const { data: visits, error: err2 } = await supabase.from('visits').select('*').limit(1);
  if (err2) {
    console.error('Error fetching visits:', err2.message);
  } else {
    console.log('Visits table is accessible!');
  }
}

test();
