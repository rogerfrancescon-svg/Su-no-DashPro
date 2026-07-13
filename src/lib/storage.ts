import { Integrado, Visit } from '../types';
import { supabase } from './supabase';
import { defaultMetas, defaultMetasFemea } from '../data';

const INTEGRADOS_KEY = 'suino_dashpro_integrados';
const VISITS_KEY = 'suino_dashpro_visits';
const OFFLINE_QUEUE_KEY = 'suino_dashpro_offline_queue';
const OFFLINE_DELETE_VISIT_QUEUE = 'suino_dashpro_offline_delete_visit';
const OFFLINE_DELETE_INTEGRADO_QUEUE = 'suino_dashpro_offline_delete_integrado';

const getIntegradosLocal = (): Integrado[] => {
  try {
    const data = localStorage.getItem(INTEGRADOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const getVisitsLocal = (): Visit[] => {
  try {
    const data = localStorage.getItem(VISITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const formatDate = (dStr: string) => {
  if (!dStr) return '';
  if (dStr.includes('-')) {
    const p = dStr.split('-');
    return p[0].length === 4 ? dStr : `${p[2]}-${p[1]}-${p[0]}`;
  }
  if (dStr.includes('/')) {
    const p = dStr.split('/');
    return p[0].length === 4 ? dStr.replace(/\//g, '-') : `${p[2]}-${p[1]}-${p[0]}`;
  }
  return dStr;
};

export const storage = {
  syncFromSupabase: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id === 'offline') {
        console.warn('Cannot sync from Supabase: No active session');
        return false;
      }
      
      // Process offline queue before fetching
      try {
        // 1. Process Integrado deletes
        const delIntQueue = JSON.parse(localStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
        for (const intName of delIntQueue) {
            const { error } = await supabase.from('registros').delete().eq('Integrado', intName);
            if (error) throw error;
        }
        if (delIntQueue.length > 0) localStorage.removeItem(OFFLINE_DELETE_INTEGRADO_QUEUE);

        // 2. Process Visit deletes
        const delVisitQueue = JSON.parse(localStorage.getItem(OFFLINE_DELETE_VISIT_QUEUE) || '[]');
        if (delVisitQueue.length > 0) {
            for (let i = 0; i < delVisitQueue.length; i += 500) {
                const chunk = delVisitQueue.slice(i, i + 500);
                const { error } = await supabase.from('registros').delete().in('id', chunk);
                if (error) throw error;
            }
            localStorage.removeItem(OFFLINE_DELETE_VISIT_QUEUE);
        }

        // 3. Process Upserts
        const queueStr = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (queueStr) {
          const queue = JSON.parse(queueStr);
          if (queue && queue.length > 0) {
            console.log('Pushing offline queue to Supabase before sync:', queue.length, 'records');
            await storage.saveVisits(getVisitsLocal(), queue);
            localStorage.removeItem(OFFLINE_QUEUE_KEY);
          }
        }
      } catch (e) {
        console.error('Error processing offline queue, aborting sync to protect local data:', e);
        return false; // MUST abort sync to prevent overwriting local pending data with server state!
      }

      let allData: any[] = [];
      let page = 0;
      let hasMore = true;
      
      while (hasMore) {
        const { data, error } = await supabase
          .from('registros')
          .select('*')
          .range(page * 1000, (page + 1) * 1000 - 1);
          
        if (error) {
          console.warn('Error fetching registros from Supabase:', error);
          if (allData.length === 0) return false; // If first page fails, return false
          break; // If subsequent page fails, we at least have some data
        }
        
        if (data && data.length > 0) {
          allData = allData.concat(data);
          if (data.length < 1000) {
            hasMore = false; // Last page
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log(`Supabase sync data total rows: ${allData.length}`);

      if (allData.length === 0) {
        localStorage.setItem(INTEGRADOS_KEY, JSON.stringify([]));
        localStorage.setItem(VISITS_KEY, JSON.stringify([]));
        return true;
      }

      const integradosMap = new Map<string, Integrado>();
      const visits: Visit[] = [];

      if (allData.length > 0) {
        console.log('--- SUPABASE FIRST ROW DATA ---', allData[0]);
        console.log('--- SUPABASE FIRST ROW KEYS ---', Object.keys(allData[0]));
      }

      const getCol = (row: any, colName: string) => {
        if (row[colName] !== undefined) return row[colName];
        const lowerColName = colName.toLowerCase();
        for (const key of Object.keys(row)) {
          if (key.toLowerCase() === lowerColName) return row[key];
        }
        return undefined;
      };

      const parseFloatSafe = (valStr: any): number | undefined => {
        if (valStr === null || valStr === undefined) return undefined;
        let clean = String(valStr).trim();
        if (!clean || clean === '-' || clean === '') return undefined;
        
        clean = clean.replace(/[^\d.,-]/g, '');
        if (clean.includes(',') && clean.includes('.')) {
          const lastComma = clean.lastIndexOf(',');
          const lastDot = clean.lastIndexOf('.');
          if (lastComma > lastDot) {
            clean = clean.replace(/\./g, '').replace(',', '.');
          } else {
            clean = clean.replace(/,/g, '');
          }
        } else if (clean.includes(',')) {
          clean = clean.replace(',', '.');
        }
        
        const num = parseFloat(clean);
        return isNaN(num) ? undefined : num;
      };

      for (const row of allData) {
        const integradoNome = getCol(row, 'Integrado');
        if (!integradoNome) continue;
        
        const alojamentoData = formatDate(getCol(row, 'Alojamento') || '');
        const integradoId = `i_${integradoNome.replace(/\s+/g, '').toLowerCase()}_${alojamentoData.replace(/[-/]/g, '')}`;
        
        if (!integradosMap.has(integradoId)) {
          integradosMap.set(integradoId, {
            id: integradoId,
            name: integradoNome,
            alojamentoDate: alojamentoData,
            status: 'Em andamento'
          });
        }
        
        const dataVisita = formatDate(getCol(row, 'Data') || '');
        if (dataVisita) {
          const vDate = new Date(dataVisita + 'T12:00:00');
          const aDate = new Date(alojamentoData + 'T12:00:00');
          const diffDays = Math.round((vDate.getTime() - aDate.getTime()) / (1000 * 60 * 60 * 24));
          const calculatedIdade = diffDays >= 0 ? diffDays : 0;

          const tipoLote = (getCol(row, 'Tipo Lote') as any) || 'Misto';
          const metas = tipoLote === 'Fêmea' ? defaultMetasFemea : defaultMetas;
          
          visits.push({
            id: getCol(row, 'id'),
            integradoId: integradoId,
            date: dataVisita,
            idade: calculatedIdade,
            animaisAlojados: parseFloatSafe(getCol(row, 'Animais Alojados')),
            animaisMortos: parseFloatSafe(getCol(row, 'Animais Mortos')),
            mortalidade: parseFloatSafe(getCol(row, 'Mortalidade')),
            volumeTotalCargas: parseFloatSafe(getCol(row, 'Vol. Cargas (kg)')),
            recomendacao: getCol(row, 'Recomendação') || '',
            consumoAcumuladoReal: parseFloatSafe(getCol(row, 'Consumo Acumulado Real') ?? getCol(row, 'Consumo acumulado')),

            comedouro: (getCol(row, 'Comedouro') as any) || 'Automático',
            tipoLote,
            colaborador: getCol(row, 'Colaborador') || '',
            pesoAloj: parseFloatSafe(getCol(row, 'Peso aloj')),
            pontuacaoSanitaria: parseFloatSafe(getCol(row, 'Pontuação Sanitária')),
            metaAlojamento: parseFloatSafe(getCol(row, 'Meta Aloj')) ?? metas.metaAlojamento,
            consumoAlojamento: parseFloatSafe(getCol(row, 'Cons. Aloj')),
            metaCrescimento1: parseFloatSafe(getCol(row, 'Meta Cresc 1')) ?? metas.metaCrescimento1,
            consumoCrescimento1: parseFloatSafe(getCol(row, 'Cons. Cresc 1')),
            metaCrescimento2: parseFloatSafe(getCol(row, 'Meta Cresc 2')) ?? metas.metaCrescimento2,
            consumoCrescimento2: parseFloatSafe(getCol(row, 'Cons. Cresc 2')),
            metaCrescimento3: parseFloatSafe(getCol(row, 'Meta Cresc 3')) ?? metas.metaCrescimento3,
            consumoCrescimento3: parseFloatSafe(getCol(row, 'Cons. Cresc 3')),
            metaTerminacao1: parseFloatSafe(getCol(row, 'Meta Term 1')) ?? metas.metaTerminacao1,
            consumoTerminacao1: parseFloatSafe(getCol(row, 'Cons. Term 1')),
            metaTerminacao2: parseFloatSafe(getCol(row, 'Meta Term 2')) ?? metas.metaTerminacao2,
            consumoTerminacao2: parseFloatSafe(getCol(row, 'Cons. Term 2')),
            metaAcumulada: parseFloatSafe(getCol(row, 'Meta Acum.')) ?? metas.metaAcumulada,
          });
        }
      }

      const integrados = Array.from(integradosMap.values());
      localStorage.setItem(INTEGRADOS_KEY, JSON.stringify(integrados));
      localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
      return true;
    } catch (e) {
      console.warn('Failed to sync from supabase:', e);
      return false;
    }
  },

  getIntegrados: async (): Promise<Integrado[]> => {
    await storage.syncFromSupabase();
    return getIntegradosLocal();
  },

  getVisits: async (): Promise<Visit[]> => {
    // syncFromSupabase já é chamado por getIntegrados() no carregamento
    return getVisitsLocal();
  },
  
  saveIntegrados: async (integrados: Integrado[]) => {
    localStorage.setItem(INTEGRADOS_KEY, JSON.stringify(integrados));
  },

  saveVisits: async (visits: Visit[], visitsToSyncToSupabase?: Visit[]): Promise<Visit[]> => {
    let session = null;
    try {
      const res = await supabase.auth.getSession();
      session = res.data.session;
    } catch (e) {}

    const userId = session?.user?.id;
    
    const integrados = getIntegradosLocal();
    
    const toUpdate = [];
    const toInsert = [];
    const originalVisitsWithFakeIds: Visit[] = [];
    
    const toProcess = visitsToSyncToSupabase || visits;
    
    for (const v of toProcess) {
      const integrado = integrados.find(i => i.id === v.integradoId);
      const toNum = (val: any) => (val === '' || val === null || val === undefined || isNaN(Number(val))) ? null : Number(val);
      const row: any = {
        'Data': v.date,
        'Integrado': integrado?.name || 'Desconhecido',
        'Alojamento': integrado?.alojamentoDate || '',
        'Tipo Lote': v.tipoLote || 'Misto',
        'Idade': toNum(v.idade) || 0,
        'Animais Alojados': toNum(v.animaisAlojados),
        'Animais Mortos': toNum(v.animaisMortos),
        'Vol. Cargas (kg)': toNum(v.volumeTotalCargas),
        'Recomendação': v.recomendacao || '',
        'Consumo acumulado': toNum(v.consumoAcumuladoReal),
        'Comedouro': v.comedouro || '',
        'Colaborador': v.colaborador || '',
        'Meta Aloj': toNum(v.metaAlojamento),
        'Cons. Aloj': toNum(v.consumoAlojamento),
        'Meta Cresc 1': toNum(v.metaCrescimento1),
        'Cons. Cresc 1': toNum(v.consumoCrescimento1),
        'Meta Cresc 2': toNum(v.metaCrescimento2),
        'Cons. Cresc 2': toNum(v.consumoCrescimento2),
        'Meta Cresc 3': toNum(v.metaCrescimento3),
        'Cons. Cresc 3': toNum(v.consumoCrescimento3),
        'Meta Term 1': toNum(v.metaTerminacao1),
        'Cons. Term 1': toNum(v.consumoTerminacao1),
        'Meta Term 2': toNum(v.metaTerminacao2),
        'Cons. Term 2': toNum(v.consumoTerminacao2),
        'Meta Acum.': toNum(v.metaAcumulada),
        'Peso aloj': toNum(v.pesoAloj),
        'Pontuação Sanitária': toNum(v.pontuacaoSanitaria),
      };
      
      if (userId) {
        row.user_id = userId;
      }
      
      if (v.id && !v.id.toString().startsWith('v_') && !v.id.toString().startsWith('dummy_')) {
        row.id = v.id;
        toUpdate.push(row);
      } else {
        toInsert.push(row);
        originalVisitsWithFakeIds.push(v);
      }
    }

    try {
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: skipping saveVisits to Supabase');
        
        // Add to offline queue
        try {
          const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
          
          // Add newly modified visits to queue
          for (const v of toProcess) {
            const existingIdx = queue.findIndex((q: any) => q.id === v.id);
            if (existingIdx >= 0) {
              queue[existingIdx] = v;
            } else {
              queue.push(v);
            }
          }
          
          localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
          console.log('Added ' + toProcess.length + ' visits to offline queue');
        } catch (e) {
          console.error('Failed to add to offline queue', e);
        }
      } else {
        if (toUpdate.length > 0) {
          for (let i = 0; i < toUpdate.length; i += 500) {
            const chunk = toUpdate.slice(i, i + 500);
            const { error } = await supabase.from('registros').upsert(chunk);
            if (error) {
              console.warn('Supabase upsert error:', error);
              throw new Error(error.message);
            }
          }
        }
        if (toInsert.length > 0) {
          let insertedRows: any[] = [];
          for (let i = 0; i < toInsert.length; i += 500) {
            const chunk = toInsert.slice(i, i + 500);
            const { data, error } = await supabase.from('registros').insert(chunk).select('id');
            if (error) {
              console.warn('Supabase insert error:', error);
              throw new Error(error.message);
            }
            if (data) insertedRows = insertedRows.concat(data);
          }
          
          // Update local visits with real IDs
          if (insertedRows.length === originalVisitsWithFakeIds.length) {
            for (let i = 0; i < insertedRows.length; i++) {
              originalVisitsWithFakeIds[i].id = insertedRows[i].id;
            }
          }
        }
      }
      
      // Save updated visits to local storage only if DB push was successful (or offline)
      localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    } catch (e: any) {
      console.warn('saveVisits failed:', e);
      throw e; // Propagate the error to the UI
    }
    
    return visits;
  },

  deleteIntegrado: async (id: string, visitIds?: string[]) => {
    const integrados = getIntegradosLocal();
    const toDelete = integrados.find(i => i.id === id);
    if (!toDelete) return;

    const remaining = integrados.filter(i => i.id !== id);
    localStorage.setItem(INTEGRADOS_KEY, JSON.stringify(remaining));
    
    const visits = getVisitsLocal().filter(v => v.integradoId !== id);
    localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: queuing deleteIntegrado for Supabase');
        const queue = JSON.parse(localStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
        if (!queue.includes(toDelete.name)) {
            queue.push(toDelete.name);
            localStorage.setItem(OFFLINE_DELETE_INTEGRADO_QUEUE, JSON.stringify(queue));
        }
        // Also remove its visits from upsert queue
        const upsertQ = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
        const remainingUpserts = upsertQ.filter((v: any) => v.integradoId !== id);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingUpserts));
      } else {
        if (visitIds && visitIds.length > 0) {
          for (let i = 0; i < visitIds.length; i += 500) {
            const chunk = visitIds.slice(i, i + 500);
            const { error } = await supabase.from('registros').delete().in('id', chunk);
            if (error) throw error;
          }
        }
        // Always delete by Integrado name as a fallback to catch any orphaned records
        const { error: err2 } = await supabase.from('registros')
          .delete()
          .eq('Integrado', toDelete.name);
        if (err2) throw err2;
      }
    } catch (e: any) {
      throw e;
    }
  },

  deleteVisit: async (id: string) => {
    const visits = getVisitsLocal().filter(v => v.id !== id);
    localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: queuing deleteVisit for Supabase');
        // Remove from upsert queue first
        const upsertQ = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
        const remainingUpserts = upsertQ.filter((v: any) => v.id !== id);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingUpserts));
        
        // If it was a real ID, add to delete queue
        if (!id.toString().startsWith('v_') && !id.toString().startsWith('dummy_')) {
            const queue = JSON.parse(localStorage.getItem(OFFLINE_DELETE_VISIT_QUEUE) || '[]');
            if (!queue.includes(id)) {
                queue.push(id);
                localStorage.setItem(OFFLINE_DELETE_VISIT_QUEUE, JSON.stringify(queue));
            }
        }
      } else {
        const { error } = await supabase.from('registros').delete().eq('id', id);
        if (error) throw error;
      }
    } catch (e: any) {
      throw e;
    }
  },

  clearAll: async () => {
    localStorage.removeItem(INTEGRADOS_KEY);
    localStorage.removeItem(VISITS_KEY);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: skipping clearAll from Supabase');
      } else {
        const { error } = await supabase.from('registros').delete().not('id', 'is', null);
        if (error) throw error;
      }
    } catch (e: any) {
      throw e;
    }
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
      let supabaseData: any[] = [];
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

    } catch (error: any) {
      console.error('Erro ao verificar consistência:', error.message);
    }
  }
};


if (typeof window !== 'undefined') {
  (window as any).verifyDataConsistency = storage.verifyDataConsistency;
}
