import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('registros').select('*').limit(1);
  console.log("DATA:", data);
  if (data && data.length > 0) {
    console.log("ID Type:", typeof data[0].id);
  }
}
run();
