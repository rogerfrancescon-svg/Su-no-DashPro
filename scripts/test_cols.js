import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  let res = await supabase.from('registros').select('date')
  console.log('date:', res.error)
  res = await supabase.from('registros').select('data_visita')
  console.log('data_visita:', res.error)
  res = await supabase.from('registros').select('alojamento')
  console.log('alojamento:', res.error)
  res = await supabase.from('registros').select('id')
  console.log('id:', res.error)
  res = await supabase.from('registros').select('created_at')
  console.log('created_at:', res.error)
}
test()
