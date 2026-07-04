import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = 'testuser' + Math.floor(Math.random() * 10000) + '@gmail.com';
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  })
  
  const uid = authData?.user?.id;
  
  if (uid) {
      const { error: insError } = await supabase.from('registros').insert([{ 'Integrado': 'Test', user_id: uid }])
      console.log('Insert omit ID:', insError?.message || insError)
  }
}
test()
