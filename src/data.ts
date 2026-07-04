import { GrowthCurvePoint, Integrado, Visit } from './types';
import { pdfData } from './pdf-data';

// Interpolated data from the Cargill table
export const growthCurve: GrowthCurvePoint[] = [
  { dia: 1, pesoInicial: 22.30, pesoFinal: 23.00, cmd: 1.080, consumoAcumulado: 1.08, gpd: 0.700 },
  { dia: 10, pesoInicial: 29.09, pesoFinal: 29.91, cmd: 1.278, consumoAcumulado: 11.75, gpd: 0.816 },
  { dia: 20, pesoInicial: 37.88, pesoFinal: 38.85, cmd: 1.677, consumoAcumulado: 26.61, gpd: 0.962 },
  { dia: 30, pesoInicial: 47.87, pesoFinal: 48.91, cmd: 1.913, consumoAcumulado: 44.70, gpd: 1.041 },
  { dia: 40, pesoInicial: 58.72, pesoFinal: 59.86, cmd: 2.294, consumoAcumulado: 66.00, gpd: 1.143 },
  { dia: 50, pesoInicial: 70.40, pesoFinal: 71.59, cmd: 2.543, consumoAcumulado: 90.18, gpd: 1.187 },
  { dia: 60, pesoInicial: 82.35, pesoFinal: 83.55, cmd: 2.716, consumoAcumulado: 116.60, gpd: 1.198 },
  { dia: 70, pesoInicial: 94.12, pesoFinal: 95.41, cmd: 2.806, consumoAcumulado: 144.49, gpd: 1.296 },
  { dia: 80, pesoInicial: 106.56, pesoFinal: 107.70, cmd: 2.834, consumoAcumulado: 173.09, gpd: 1.140 },
  { dia: 90, pesoInicial: 117.63, pesoFinal: 118.68, cmd: 2.980, consumoAcumulado: 202.35, gpd: 1.046 },
  { dia: 100, pesoInicial: 127.54, pesoFinal: 128.48, cmd: 2.980, consumoAcumulado: 232.15, gpd: 0.942 }
];

export const defaultMetas = {
  metaAlojamento: 17.00,
  metaCrescimento1: 30.82,
  metaCrescimento2: 30.67,
  metaCrescimento3: 45.71,
  metaTerminacao1: 27.49,
  metaTerminacao2: 63.15,
  metaAcumulada: 214.85
};

export const getExpectedConsumption = (idade: number): number => {
  // Linear interpolation for exact day
  const exactMatch = growthCurve.find(p => p.dia === idade);
  if (exactMatch) return exactMatch.consumoAcumulado;

  const sorted = [...growthCurve].sort((a, b) => a.dia - b.dia);
  
  if (idade <= sorted[0].dia) return sorted[0].consumoAcumulado;
  if (idade >= sorted[sorted.length - 1].dia) return sorted[sorted.length - 1].consumoAcumulado;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (idade > sorted[i].dia && idade < sorted[i+1].dia) {
      const p1 = sorted[i];
      const p2 = sorted[i+1];
      const ratio = (idade - p1.dia) / (p2.dia - p1.dia);
      return Number((p1.consumoAcumulado + ratio * (p2.consumoAcumulado - p1.consumoAcumulado)).toFixed(2));
    }
  }

  return sorted[0].consumoAcumulado; // Approx
};

// Parser
function parsePdfData() {
  const integradosMap = new Map<string, Integrado>();
  const visits: Visit[] = [];
  
  const lines = pdfData.trim().split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(-?\d+)\s+(.+?)\s+(Automático|Linear|Misto|Multitratos|Basculante|Robô|automático com\s+água)\s+([^\d]+)\s+([\d.]+)\s+(\d+)$/i);
    
    if (match) {
      const [, dateStr, name, alojamentoStr, idadeStr, rec, comedouro, colab, consumoStr, mortStr] = match;
      
      const id = `i_${name.replace(/\s+/g, '').toLowerCase()}`;
      if (!integradosMap.has(id)) {
        integradosMap.set(id, {
          id,
          name: name.trim(),
          alojamentoDate: alojamentoStr.split('/').reverse().join('-'), // YYYY-MM-DD
          status: 'Em andamento'
        });
      }
      
      let parsedComedouro = 'Automático';
      if (comedouro.toLowerCase().includes('linear')) parsedComedouro = 'Linear';
      if (comedouro.toLowerCase().includes('misto')) parsedComedouro = 'Misto';
      
      visits.push({
        id: `v_${id}_${index}`,
        integradoId: id,
        date: dateStr.split('/').reverse().join('-'),
        idade: parseInt(idadeStr, 10),
        recomendacao: rec.trim(),
        comedouro: parsedComedouro as 'Automático' | 'Linear' | 'Misto',
        colaborador: colab.trim(),
        consumoAcumuladoReal: parseFloat(consumoStr) || 0,
        mortalidade: parseInt(mortStr, 10) || 0
      });
    }
  });

  return { 
    parsedIntegrados: Array.from(integradosMap.values()), 
    parsedVisits: visits 
  };
}

const { parsedIntegrados, parsedVisits } = parsePdfData();

export const initialIntegrados: Integrado[] = parsedIntegrados.length > 0 ? parsedIntegrados : [
  { id: '1', name: 'Arildo Valcarenghi', alojamentoDate: '2026-03-30', status: 'Em andamento' },
  { id: '2', name: 'Wanderlei Richit', alojamentoDate: '2026-03-23', status: 'Em andamento' }
];

export const initialVisits: Visit[] = parsedVisits.length > 0 ? parsedVisits : [
  {
    id: 'v1', date: '2026-04-28', integradoId: '1', idade: 29, 
    recomendacao: 'Consumo acumulado 49,83 kg e tabela 51,36 kg',
    comedouro: 'Automático', colaborador: 'Wagner', consumoAcumuladoReal: 49.83, mortalidade: 0.12
  }
];
