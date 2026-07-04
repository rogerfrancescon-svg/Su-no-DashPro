import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const row = {
    'fake_column_does_not_exist': 'test',
    'Data': '2024-07-03'
  };
  const { error } = await supabase.from('registros').upsert([row]);
  console.log("UPSERT ERROR:", error);
}
run();
