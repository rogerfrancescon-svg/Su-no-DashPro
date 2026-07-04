import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = 'testuser' + Math.floor(Math.random() * 10000) + '@gmail.com';
  const { data: authData } = await supabase.auth.signUp({
    email,
    password: 'password123'
  })
  
  // try inserting an integer id
  const { error } = await supabase.from('registros').upsert([{ id: 999999999, 'Integrado': 'T' }])
  console.log('Insert int ID error:', error?.message || error)

  // try inserting a uuid
  const { error: err2 } = await supabase.from('registros').upsert([{ id: '123e4567-e89b-12d3-a456-426614174000', 'Integrado': 'T' }])
  console.log('Insert UUID error:', err2?.message || err2)
}
test()
