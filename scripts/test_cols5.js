import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const chars = ['Consumos de Ração', 'Consumos de Ração/meta', 'Pontuação Sanitária', 'Pontuacao Sanitaria']
  for (const c of chars) {
    const res = await supabase.from('registros').select(`"${c}"`)
    console.log(c, '->', res.error?.hint || res.error?.message)
  }
}
test()
