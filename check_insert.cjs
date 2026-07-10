const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('registros').insert([{ 'Data': '2026-01-01', 'Integrado': 'TEST' }]).select();
  console.log('Insert Error:', error);
  console.log('Inserted Data:', data);
}
run();
