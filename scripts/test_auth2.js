import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'testuser' + Math.floor(Math.random() * 10000) + '@gmail.com',
    password: 'password123'
  })
  console.log('Auth:', authError || 'Success')

  const { data, error } = await supabase.from('registros').upsert([{ 
    id: 'test_insert', 
    'Data': '2023-01-01', 
    'Integrado': 'Test Integrado',
    'Alojamento': '2023-01-01',
    'Idade': 10,
    'Recomendação': 'Test',
    'Consumo acumulado': 1,
    'Mortalidade': 1,
    'Comedouro': 'Misto',
    'Colaborador': 'Wagner',
    'Consumos de Ração/meta': 'Test',
    'Peso aloj': 1,
    'Pontuação Sanitária': 1
  }])
  console.log('Error:', error)
  console.log('Data:', data)
}
test()
