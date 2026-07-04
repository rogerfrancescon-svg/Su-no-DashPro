import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing integrados columns...');
  const { error: err1 } = await supabase.from('integrados').select('id, name, loteNumber, alojamentoDate, status, fechamentoDate').limit(1);
  if (err1) {
    console.error('Error in integrados:', err1.message);
  } else {
    console.log('Integrados columns are correct!');
  }

  console.log('Testing visits columns...');
  const { error: err2 } = await supabase.from('visits').select('id, date, integradoId, idade, recomendacao, comedouro, colaborador, consumoAcumuladoReal, mortalidade').limit(1);
  if (err2) {
    console.error('Error in visits:', err2.message);
  } else {
    console.log('Visits columns are correct!');
  }
}

test();
