import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const response = await fetch(`${supabaseUrl}/rest/v1/registros?limit=1`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  console.log(await response.json())
}
test()
