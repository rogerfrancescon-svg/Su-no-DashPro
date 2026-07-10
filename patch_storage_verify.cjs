const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const target = `  clearAll: async () => {
    localStorage.removeItem(INTEGRADOS_KEY);
    localStorage.removeItem(VISITS_KEY);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: skipping clearAll from Supabase');
      } else {
        await supabase.from('registros').delete().neq('id', '0');
      }
    } catch (e) {}
  }
};`;

const newTarget = `  clearAll: async () => {
    localStorage.removeItem(INTEGRADOS_KEY);
    localStorage.removeItem(VISITS_KEY);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: skipping clearAll from Supabase');
      } else {
        await supabase.from('registros').delete().neq('id', '0');
      }
    } catch (e) {}
  },
  
  verifyDataConsistency: async () => {
    console.log('--- INICIANDO VERIFICAÇÃO DE CONSISTÊNCIA ---');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Usuário offline, impossível verificar com o Supabase.');
        return;
      }

      // 1. Fetch all Supabase records
      console.log('1. Buscando registros no Supabase...');
      let supabaseData = [];
      let page = 0;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from('registros')
          .select('*')
          .range(page * 1000, (page + 1) * 1000 - 1);
        if (error) throw error;
        if (data && data.length > 0) {
          supabaseData = supabaseData.concat(data);
          page++;
        } else {
          hasMore = false;
        }
      }
      console.log('-> Encontrados ' + supabaseData.length + ' registros no Supabase.');

      // 2. Get local records
      console.log('2. Buscando registros locais...');
      const localVisits = getVisitsLocal();
      const localIntegrados = getIntegradosLocal();
      console.log('-> Encontrados ' + localVisits.length + ' registros locais.');

      // 3. Compare data
      const supabaseIds = new Set(supabaseData.map(r => r.id));
      const localIds = new Set(localVisits.map(v => v.id));

      const missingInSupabase = localVisits.filter(v => !supabaseIds.has(v.id));
      const missingInLocal = supabaseData.filter(r => !localIds.has(r.id));

      console.log('--- RESULTADOS DA COMPARAÇÃO ---');
      if (missingInSupabase.length === 0 && missingInLocal.length === 0) {
        console.log('✅ Tudo perfeitamente sincronizado! (Mesma quantidade de IDs)');
      } else {
        if (missingInSupabase.length > 0) {
          console.warn('❌ Faltam ' + missingInSupabase.length + ' registros no Supabase que estão no Local:');
          missingInSupabase.forEach(v => {
            const int = localIntegrados.find(i => i.id === v.integradoId);
            console.warn('  - ID local: ' + v.id + ' | Data: ' + v.date + ' | Integrado: ' + (int?.name || 'Desconhecido'));
          });
        }
        
        if (missingInLocal.length > 0) {
          console.warn('❌ Faltam ' + missingInLocal.length + ' registros no Local que estão no Supabase:');
          missingInLocal.forEach(r => {
            console.warn('  - ID supabase: ' + r.id + ' | Data: ' + r['Data'] + ' | Integrado: ' + r['Integrado']);
          });
        }
      }

      console.log('--- FIM DA VERIFICAÇÃO ---');
      
      console.log('Checando políticas (RLS) para possíveis falhas de insert...');
      const { data: testData, error: testError } = await supabase.from('registros').insert([{ 'Data': 'TEST_RLS' }]).select();
      if (testError && testError.code === '42501') {
        console.error('🚨 ERRO GRAVE DE RLS DETECTADO: Políticas do Supabase estão bloqueando INSERTS.');
        console.error('Para consertar, rode isso no SQL Editor do Supabase: ALTER TABLE registros DISABLE ROW LEVEL SECURITY;');
      } else if (!testError) {
        console.log('✅ RLS parece estar permitindo inserts. (Apagando dado de teste...)');
        await supabase.from('registros').delete().eq('Data', 'TEST_RLS');
      }

    } catch (error) {
      console.error('Erro ao verificar consistência:', error.message);
    }
  }
};`;

code = code.replace(target, newTarget);
fs.writeFileSync('src/lib/storage.ts', code);
