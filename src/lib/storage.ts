import { Integrado, Visit } from '../types';
import { supabase } from './supabase';
import { defaultMetas } from '../data';

const INTEGRADOS_KEY = 'agridash_integrados';
const VISITS_KEY = 'agridash_visits';

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

      for (const row of allData) {
        const integradoNome = row['Integrado'];
        if (!integradoNome) continue;
        
        const alojamentoData = formatDate(row['Alojamento'] || '');
        const integradoId = `i_${integradoNome.replace(/\s+/g, '').toLowerCase()}_${alojamentoData.replace(/[-/]/g, '')}`;
        
        if (!integradosMap.has(integradoId)) {
          integradosMap.set(integradoId, {
            id: integradoId,
            name: integradoNome,
            alojamentoDate: alojamentoData,
            status: 'Em andamento'
          });
        }
        
        const dataVisita = formatDate(row['Data'] || '');
        if (dataVisita) {
          visits.push({
            id: row.id,
            integradoId: integradoId,
            date: dataVisita,
            idade: Number(row['Idade']) || 0,
            animaisAlojados: row['Animais Alojados'] !== null && row['Animais Alojados'] !== undefined ? Number(row['Animais Alojados']) : undefined,
            animaisMortos: row['Animais Mortos'] !== null && row['Animais Mortos'] !== undefined ? Number(row['Animais Mortos']) : undefined,
            volumeTotalCargas: row['Vol. Cargas (kg)'] !== null && row['Vol. Cargas (kg)'] !== undefined ? Number(row['Vol. Cargas (kg)']) : undefined,
            recomendacao: row['Recomendação'] || '',
            consumoAcumuladoReal: row['Consumo Acumulado Real'] ?? row['Consumo acumulado'] ?? undefined,
            mortalidade: row['Mortalidade'] ?? undefined,
            comedouro: (row['Comedouro'] as any) || 'Automático',
            colaborador: row['Colaborador'] || '',
            pesoAloj: row['Peso aloj'] !== null && row['Peso aloj'] !== undefined ? Number(row['Peso aloj']) : undefined,
            pontuacaoSanitaria: row['Pontuação Sanitária'] !== null && row['Pontuação Sanitária'] !== undefined ? Number(row['Pontuação Sanitária']) : undefined,
            metaAlojamento: row['Meta Alojamento'] !== null && row['Meta Alojamento'] !== undefined ? Number(row['Meta Alojamento']) : defaultMetas.metaAlojamento,
            consumoAlojamento: row['Consumo Alojamento'] !== null && row['Consumo Alojamento'] !== undefined ? Number(row['Consumo Alojamento']) : undefined,
            metaCrescimento1: row['Meta Crescimento 1'] !== null && row['Meta Crescimento 1'] !== undefined ? Number(row['Meta Crescimento 1']) : defaultMetas.metaCrescimento1,
            consumoCrescimento1: row['Consumo Crescimento 1'] !== null && row['Consumo Crescimento 1'] !== undefined ? Number(row['Consumo Crescimento 1']) : undefined,
            metaCrescimento2: row['Meta Crescimento 2'] !== null && row['Meta Crescimento 2'] !== undefined ? Number(row['Meta Crescimento 2']) : defaultMetas.metaCrescimento2,
            consumoCrescimento2: row['Consumo Crescimento 2'] !== null && row['Consumo Crescimento 2'] !== undefined ? Number(row['Consumo Crescimento 2']) : undefined,
            metaCrescimento3: row['Meta Crescimento 3'] !== null && row['Meta Crescimento 3'] !== undefined ? Number(row['Meta Crescimento 3']) : defaultMetas.metaCrescimento3,
            consumoCrescimento3: row['Consumo Crescimento 3'] !== null && row['Consumo Crescimento 3'] !== undefined ? Number(row['Consumo Crescimento 3']) : undefined,
            metaTerminacao1: row['Meta Terminação 1'] !== null && row['Meta Terminação 1'] !== undefined ? Number(row['Meta Terminação 1']) : defaultMetas.metaTerminacao1,
            consumoTerminacao1: row['Consumo Terminação 1'] !== null && row['Consumo Terminação 1'] !== undefined ? Number(row['Consumo Terminação 1']) : undefined,
            metaTerminacao2: row['Meta Terminação 2'] !== null && row['Meta Terminação 2'] !== undefined ? Number(row['Meta Terminação 2']) : defaultMetas.metaTerminacao2,
            consumoTerminacao2: row['Consumo Terminação 2'] !== null && row['Consumo Terminação 2'] !== undefined ? Number(row['Consumo Terminação 2']) : undefined,
            metaAcumulada: row['Meta Acumulada'] !== null && row['Meta Acumulada'] !== undefined ? Number(row['Meta Acumulada']) : defaultMetas.metaAcumulada,
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
      const row: any = {
        'Data': v.date,
        'Integrado': integrado?.name || 'Desconhecido',
        'Alojamento': integrado?.alojamentoDate || '',
        'Idade': v.idade,
        'Animais Alojados': v.animaisAlojados ?? null,
        'Animais Mortos': v.animaisMortos ?? null,
        'Vol. Cargas (kg)': v.volumeTotalCargas ?? null,
        'Recomendação': v.recomendacao || '',
        'Consumo acumulado': v.consumoAcumuladoReal ?? null,
        'Mortalidade': v.mortalidade ?? null,
        'Comedouro': v.comedouro || '',
        'Colaborador': v.colaborador || '',
        'Meta Alojamento': v.metaAlojamento || null,
        'Consumo Alojamento': v.consumoAlojamento || null,
        'Meta Crescimento 1': v.metaCrescimento1 || null,
        'Consumo Crescimento 1': v.consumoCrescimento1 || null,
        'Meta Crescimento 2': v.metaCrescimento2 || null,
        'Consumo Crescimento 2': v.consumoCrescimento2 || null,
        'Meta Crescimento 3': v.metaCrescimento3 || null,
        'Consumo Crescimento 3': v.consumoCrescimento3 || null,
        'Meta Terminação 1': v.metaTerminacao1 || null,
        'Consumo Terminação 1': v.consumoTerminacao1 || null,
        'Meta Terminação 2': v.metaTerminacao2 || null,
        'Consumo Terminação 2': v.consumoTerminacao2 || null,
        'Consumo Acumulado Real': v.consumoAcumuladoReal ?? null,
        'Meta Acumulada': v.metaAcumulada ?? null,
        'Peso aloj': v.pesoAloj ?? null,
        'Pontuação Sanitária': v.pontuacaoSanitaria ?? null,
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
    } catch (e: any) {
      console.warn('saveVisits failed:', e);
      // Do not throw to avoid unhandled rejections
    }
    
    // Save updated visits to local storage
    localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
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
        console.warn('Offline mode: skipping deleteIntegrado from Supabase');
      } else {
        if (visitIds && visitIds.length > 0) {
          for (let i = 0; i < visitIds.length; i += 500) {
            const chunk = visitIds.slice(i, i + 500);
            await supabase.from('registros').delete().in('id', chunk);
          }
        }
        // Always delete by Integrado name as a fallback to catch any orphaned records
        await supabase.from('registros')
          .delete()
          .eq('Integrado', toDelete.name);
      }
    } catch (e) {}
  },

  deleteVisit: async (id: string) => {
    const visits = getVisitsLocal().filter(v => v.id !== id);
    localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: skipping deleteVisit from Supabase');
      } else {
        await supabase.from('registros').delete().eq('id', id);
      }
    } catch (e) {}
  },

  clearAll: async () => {
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
};
