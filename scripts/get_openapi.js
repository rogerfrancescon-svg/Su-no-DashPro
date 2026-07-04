import fetch from 'node-fetch'

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';

async function test() {
  const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`)
  const data = await response.json()
  console.log(Object.keys(data.definitions.registros.properties))
}
test()
