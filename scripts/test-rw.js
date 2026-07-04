import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzjmviojwioezwffvcjq.supabase.co';
const supabaseKey = 'sb_publishable_dgn-oKGNBmvLsJ3m4APBFQ_iJpImCZ6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const testId = 'test-id-123';
  console.log('Inserting into integrados...');
  const { error: iErr } = await supabase.from('integrados').upsert({
    id: testId,
    name: 'Test Name',
    loteNumber: '123',
    alojamentoDate: '2023-01-01',
    status: 'Em andamento'
  });
  if (iErr) {
    console.error('Insert error integrados:', iErr);
  } else {
    console.log('Insert integrados success!');
  }

  console.log('Inserting into visits...');
  const { error: vErr } = await supabase.from('visits').upsert({
    id: testId,
    integradoId: testId,
    date: '2023-01-02',
    idade: 10,
    recomendacao: 'Test',
    comedouro: 'Linear',
    colaborador: 'Test',
    consumoAcumuladoReal: 100
  });
  if (vErr) {
    console.error('Insert error visits:', vErr);
  } else {
    console.log('Insert visits success!');
  }

  console.log('Deleting test records...');
  await supabase.from('visits').delete().eq('id', testId);
  await supabase.from('integrados').delete().eq('id', testId);
  console.log('Done!');
}

test();
