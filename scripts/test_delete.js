import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('registros').select('*').limit(1);
  console.log("SELECT:", data, error);
  if (data && data.length > 0) {
    const id = data[0].id;
    console.log("Attempting to delete id:", id);
    const { error: delError } = await supabase.from('registros').delete().eq('id', id);
    console.log("DELETE ERROR:", delError);
  }
}
run();
