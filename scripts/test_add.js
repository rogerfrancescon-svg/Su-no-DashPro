import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const row = {
    'Data': '2024-07-03',
    'Integrado': 'Test Lote',
    'Alojamento': '2024-06-01',
    'Idade': 32,
    'Recomendação': '',
    'Consumo acumulado': 100,
    'Mortalidade': 0,
    'Comedouro': 'Linear',
    'Colaborador': 'Wagner',
    'Consumos de Ração/meta': '',
    'Peso aloj': 50,
    'Pontuação Sanitária': 10
  };
  const { error } = await supabase.from('registros').upsert([row]);
  console.log("UPSERT ERROR:", error);

  const { data, error: err2 } = await supabase.from('registros').select('*').limit(5);
  console.log("SELECT:", data, err2);
}
run();
