import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const row1 = {
    'id': 'a13515ca-22e3-46ad-bf08-c8a7b0b63116',
    'Data': '2024-07-03',
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
  const row2 = {
    'Data': '2024-07-04',
    'Integrado': 'Test Lote Dummy 2',
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
  const { error } = await supabase.from('registros').upsert([row1, row2]);
  console.log("UPSERT MIXED KEYS ERROR:", error);
}
run();
