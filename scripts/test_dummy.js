import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const row = {
    'Data': '',
    'Integrado': 'Test Lote Dummy',
    'Alojamento': '2024-06-01',
    'Idade': 0,
    'Recomendação': '',
    'Consumo acumulado': 0,
    'Mortalidade': 0,
    'Comedouro': '',
    'Colaborador': '',
    'Consumos de Ração/meta': '',
    'Peso aloj': null,
    'Pontuação Sanitária': null
  };
  const { error } = await supabase.from('registros').upsert([row]);
  console.log("UPSERT DUMMY ERROR:", error);
}
run();
