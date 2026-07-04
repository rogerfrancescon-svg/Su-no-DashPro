import fetch from 'node-fetch';

async function check() {
  const res = await fetch('https://rzjmviojwioezwffvcjq.supabase.co/rest/v1/?apikey=sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6');
  const json = await res.json();
  console.log(Object.keys(json));
  console.log(Object.keys(json.definitions || {}));
}
check();
