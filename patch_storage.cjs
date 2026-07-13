const fs = require('fs');

let content = fs.readFileSync('src/lib/storage.ts', 'utf8');

// 1. Add new keys
content = content.replace("const OFFLINE_QUEUE_KEY = 'suino_dashpro_offline_queue';", 
`const OFFLINE_QUEUE_KEY = 'suino_dashpro_offline_queue';
const OFFLINE_DELETE_VISIT_QUEUE = 'suino_dashpro_offline_delete_visit';
const OFFLINE_DELETE_INTEGRADO_QUEUE = 'suino_dashpro_offline_delete_integrado';`);

// 2. Fix syncFromSupabase to process all queues and abort on failure
const syncBlockOld = `
      // Process offline queue before fetching
      try {
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
        console.error('Error processing offline queue:', e);
      }
`;

const syncBlockNew = `
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
`;
content = content.replace(syncBlockOld, syncBlockNew);

// 3. Fix deleteIntegrado
const delIntOld = `
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: skipping deleteIntegrado from Supabase');
      } else {
`;
const delIntNew = `
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
`;
content = content.replace(delIntOld, delIntNew);

// 4. Fix deleteVisit
const delVisitOld = `
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.id === 'offline') {
        console.warn('Offline mode: skipping deleteVisit from Supabase');
      } else {
`;
const delVisitNew = `
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
`;
content = content.replace(delVisitOld, delVisitNew);

fs.writeFileSync('src/lib/storage.ts', content);
console.log("storage.ts patched successfully");
