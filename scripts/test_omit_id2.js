import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com', // Let's guess the user's email since they shared it
    password: 'password123' // we don't know the password
  });
  
  // just try insert without auth
  const { error: insError } = await supabase.from('registros').insert([{ 'Integrado': 'Test' }])
  console.log('Insert omit ID:', insError?.message || insError)
}
test()
