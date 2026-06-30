import { Integrado, Visit } from '../types';

const INTEGRADOS_KEY = 'agridash_integrados';
const VISITS_KEY = 'agridash_visits';

export const storage = {
  getIntegrados: (): Integrado[] => {
    try {
      const data = localStorage.getItem(INTEGRADOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  saveIntegrados: (integrados: Integrado[]) => {
    try {
      localStorage.setItem(INTEGRADOS_KEY, JSON.stringify(integrados));
    } catch (e) {
      console.error('Failed to save integrados to local storage', e);
    }
  },

  getVisits: (): Visit[] => {
    try {
      const data = localStorage.getItem(VISITS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  saveVisits: (visits: Visit[]) => {
    try {
      localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    } catch (e) {
      console.error('Failed to save visits to local storage', e);
    }
  },

  clearAll: () => {
    localStorage.removeItem(INTEGRADOS_KEY);
    localStorage.removeItem(VISITS_KEY);
  }
};
