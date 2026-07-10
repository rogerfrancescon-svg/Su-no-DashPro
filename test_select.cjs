const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('registros').select('*');
  console.log('Error:', error);
  console.log('Rows count (anon):', data ? data.length : 0);
}
run();
