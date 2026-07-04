import fetch from 'node-fetch';

async function check() {
  const res = await fetch('https://rzjmviojwioezwffvcjq.supabase.co/rest/v1/?apikey=sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6');
  const json = await res.json();
  console.log('Integrados columns:');
  if (json.definitions && json.definitions.integrados) {
    console.log(Object.keys(json.definitions.integrados.properties));
  } else {
    console.log('No definitions for integrados found. RLS might be hiding it or table doesnt exist.');
  }
  
  console.log('\nVisits columns:');
  if (json.definitions && json.definitions.visits) {
    console.log(Object.keys(json.definitions.visits.properties));
  } else {
    console.log('No definitions for visits found.');
  }
}
check();
