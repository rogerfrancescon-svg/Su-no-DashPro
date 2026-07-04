import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const chars = ['mortalidade', 'comedouro', 'colaborador', 'recomendacao', 'consumo_acumulado', 'consumos_racao_meta', 'peso_aloj', 'pontuacao_sanitaria', 'integrado']
  for (const c of chars) {
    const res = await supabase.from('registros').select(c)
    console.log(c, '->', res.error?.hint || res.error?.message)
  }
}
test()
