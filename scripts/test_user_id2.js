import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'testuser3126@gmail.com', // from previous test
    password: 'password123'
  })
  
  if (!authData.user) return console.log('no user');

  let { data, error } = await supabase.from('registros').upsert([{ 
    id: 'test_insert', 
    'Data': '2023-01-01', 
    'Integrado': 'Test Integrado',
    'user_id': authData.user.id
  }])
  console.log('Error user_id:', error?.message)
}
test()
