import { Integrado, Visit } from '../types';
import { defaultMetas } from '../data';

export interface PreProcessedData {
  integrados: Integrado[];
  visits: Visit[];
  logs: string[];
  errors: string[];
}

export function preprocessImportData(rawData: string): PreProcessedData {
  const lines = rawData.trim().split('\n');
  const integradosMap = new Map<string, Integrado>();
  const visits: Visit[] = [];
  const logs: string[] = [];
  const errors: string[] = [];

  if (lines.length === 0) return { integrados: [], visits, logs, errors };

  // Detect delimiter based on the first few lines
  let delimiter = '\t';
  if (lines[0].includes(';')) delimiter = ';';
  else if (lines[0].includes(',')) delimiter = ',';

  // Parse all lines
  const parsedLines = lines.map(line => {
    return line.trim().split(new RegExp(`\\${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`)).map(p => p.replace(/^"|"$/g, '').trim());
  }).filter(parts => parts.length > 0 && parts.some(p => p !== ''));

  if (parsedLines.length === 0) return { integrados: [], visits, logs, errors };

  // Check if first line is a header
  const firstLine = parsedLines[0].map(s => s.toLowerCase());
  const isHeader = firstLine.some(h => h.includes('data') || h.includes('integrado') || h.includes('nome'));

  // Default mapping for old format (without headers)
  let columnMap: Record<string, number> = {
    data: 0,
    nome: 1,
    lote: -1,
    alojamento: 2,
    idade: 3,
    animaisAlojados: -1,
    recomendacao: 4,
    consumo: 5,
    mortalidade: 6,
    comedouro: 7,
    colaborador: 8,
    consumoMeta: 9,
    pesoAloj: 10,
    pontuacaoSanitaria: 11,
    metaAlojamento: -1,
    consumoAlojamento: -1,
    metaCrescimento1: -1,
    consumoCrescimento1: -1,
    metaCrescimento2: -1,
    consumoCrescimento2: -1,
    metaCrescimento3: -1,
    consumoCrescimento3: -1,
    metaTerminacao1: -1,
    consumoTerminacao1: -1,
    metaTerminacao2: -1,
    consumoTerminacao2: -1,
    consumoAcumuladoReal: -1,
    metaAcumulada: -1
  };

  let startIndex = 0;

  if (isHeader) {
    startIndex = 1;
    // Map columns based on headers
    for (let i = 0; i < firstLine.length; i++) {
      const h = firstLine[i];
      if (h.includes('data da visita') || h === 'data') columnMap.data = i;
      else if (h.includes('integrado') || h.includes('nome')) columnMap.nome = i;
      else if (h.includes('lote')) columnMap.lote = i;
      else if (h.includes('alojamento') && !h.includes('meta') && !h.includes('consumo') && !h.includes('peso')) columnMap.alojamento = i;
      else if (h.includes('idade')) columnMap.idade = i;
      else if (h.includes('animais alojados')) columnMap.animaisAlojados = i;
      else if (h.includes('recomendação') || h.includes('recomendacao')) columnMap.recomendacao = i;
      else if ((h.includes('consumo') || h.includes('acumulado')) && !h.includes('meta') && !h.includes('real') && !h.includes('alojamento') && !h.includes('crescimento') && !h.includes('terminação') && !h.includes('terminacao')) columnMap.consumo = i;
      else if (h.includes('mortalidade') || h.includes('mort')) columnMap.mortalidade = i;
      else if (h.includes('comedouro')) columnMap.comedouro = i;
      else if (h.includes('colaborador') || h.includes('técnico') || h.includes('tecnico')) columnMap.colaborador = i;
      else if (h.includes('peso aloj')) columnMap.pesoAloj = i;
      else if (h.includes('pontuação') || h.includes('pontuacao') || h.includes('sanitária') || h.includes('sanitaria') || h.includes('score')) columnMap.pontuacaoSanitaria = i;
      else if (h.includes('meta alojamento')) columnMap.metaAlojamento = i;
      else if (h.includes('consumo alojamento')) columnMap.consumoAlojamento = i;
      else if (h.includes('meta crescimento 1')) columnMap.metaCrescimento1 = i;
      else if (h.includes('consumo crescimento 1')) columnMap.consumoCrescimento1 = i;
      else if (h.includes('meta crescimento 2')) columnMap.metaCrescimento2 = i;
      else if (h.includes('consumo crescimento 2')) columnMap.consumoCrescimento2 = i;
      else if (h.includes('meta crescimento 3')) columnMap.metaCrescimento3 = i;
      else if (h.includes('consumo crescimento 3')) columnMap.consumoCrescimento3 = i;
      else if (h.includes('meta terminação 1') || h.includes('meta terminacao 1')) columnMap.metaTerminacao1 = i;
      else if (h.includes('consumo terminação 1') || h.includes('consumo terminacao 1')) columnMap.consumoTerminacao1 = i;
      else if (h.includes('meta terminação 2') || h.includes('meta terminacao 2')) columnMap.metaTerminacao2 = i;
      else if (h.includes('consumo terminação 2') || h.includes('consumo terminacao 2')) columnMap.consumoTerminacao2 = i;
      else if (h.includes('consumo acumulado real')) columnMap.consumoAcumuladoReal = i;
      else if (h.includes('meta acumulada')) columnMap.metaAcumulada = i;
    }
    logs.push(`Cabeçalho detectado. Mapeamento de colunas ajustado dinamicamente.`);
  }

  let parsedCount = 0;
  
  const parseFloatSafe = (valStr: string | undefined): number | undefined => {
      const clean = (valStr || '').trim();
      if (!clean) return undefined;
      let val = 0;
      if (clean.includes(',')) {
          val = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
      } else {
          val = parseFloat(clean);
      }
      return isNaN(val) ? undefined : val;
  };

  for (let i = startIndex; i < parsedLines.length; i++) {
    const parts = parsedLines[i];
    const originalLineIndex = i + 1;
    
    let dateStr, name, loteStr, alojamentoStr, idadeStr, rec, consumoStr, mortStr, comedouro, colab, pesoAlojStr, pontuacaoSanitariaStr;

    // Try array access first
    if (parts.length >= 3) {
      dateStr = parts[columnMap.data];
      name = parts[columnMap.nome];
      loteStr = columnMap.lote >= 0 ? parts[columnMap.lote] : '';
      alojamentoStr = parts[columnMap.alojamento];
      idadeStr = parts[columnMap.idade];
      rec = parts[columnMap.recomendacao];
      consumoStr = parts[columnMap.consumo];
      mortStr = parts[columnMap.mortalidade];
      comedouro = parts[columnMap.comedouro];
      colab = parts[columnMap.colaborador];
      pesoAlojStr = parts[columnMap.pesoAloj];
      pontuacaoSanitariaStr = parts[columnMap.pontuacaoSanitaria];
    } else {
      // Fallback regex for unstructured spaces if standard delimiter splitting failed to yield enough columns
      const rawLine = lines[i].trim();
      const match = rawLine.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(-?\d+)\s+(.+?)\s+([\d.,]+)\s+(\d+)\s+(Automático|Linear|Misto|Multitratos|Basculante|Robô|automático com\s+água|AUSTER)\s+([^\d\t\n]+)\s*(.*)$/i);
      if (match) {
        [, dateStr, name, alojamentoStr, idadeStr, rec, consumoStr, mortStr, comedouro, colab] = match;
      }
    }

    if (!dateStr || !name || !alojamentoStr) {
      logs.push(`Aviso: Linha ${originalLineIndex} não possui os campos obrigatórios (Data, Nome, Alojamento) e será ignorada.`);
      continue;
    }

    // Normalization and Validation Helpers
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

    const finalDateStr = formatDate(dateStr);
    const finalAlojamentoStr = formatDate(alojamentoStr);
    
    const parsedDate = new Date(finalDateStr);
    const parsedAlojamento = new Date(finalAlojamentoStr);
    
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Erro na linha ${originalLineIndex}: Data da visita inválida (${dateStr})`);
      continue;
    }
    
    if (isNaN(parsedAlojamento.getTime())) {
      errors.push(`Erro na linha ${originalLineIndex}: Data de alojamento inválida (${alojamentoStr})`);
      continue;
    }

    // Calculate age correctly
    let calculatedIdade = parseInt(idadeStr || '0', 10) || 0;
    const diffTime = parsedDate.getTime() - parsedAlojamento.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= -10 && diffDays <= 200) { 
        calculatedIdade = diffDays;
    }

    // Consider closed if age > 120 days
    const isClosed = calculatedIdade > 120;

    // Fix names and IDs
    name = name.trim();
    if (!name) {
      errors.push(`Erro na linha ${originalLineIndex}: Nome do integrado não encontrado.`);
      continue;
    }
    
    const alojamentoStrClean = (finalAlojamentoStr || '').replace(/[-/]/g, '');
    const id = `i_${name.replace(/\s+/g, '').toLowerCase()}_${alojamentoStrClean}`;

    if (!integradosMap.has(id)) {
      integradosMap.set(id, {
        id,
        name,
        loteNumber: (loteStr || '').trim() || undefined,
        alojamentoDate: finalAlojamentoStr,
        status: isClosed ? 'Fechado' : 'Em andamento'
      });
    } else if (isClosed) {
      const existing = integradosMap.get(id);
      if (existing) {
        existing.status = 'Fechado';
      }
    }

    let parsedComedouro = 'Automático';
    const cLow = (comedouro || '').toLowerCase();
    if (cLow.includes('linear')) parsedComedouro = 'Linear';
    if (cLow.includes('misto')) parsedComedouro = 'Misto';

    let consumo = parseFloatSafe(consumoStr) || 0;
    if (consumo < 0) consumo = 0;
    
    // Normalization for mortality (often imported with dots like 1.000 instead of 1000 or trailing spaces)
    let mortStrClean = (mortStr || '0').trim().replace(/\./g, '');
    let mort = parseInt(mortStrClean, 10);
    if (isNaN(mort) || mort < 0) mort = 0;

    if (consumo === 0 && rec) {
      const recMatch = rec.match(/consumo.*?(?:de\s+)?([\d.,]+)\s*kg/i);
      if (recMatch) {
        let matchStr = recMatch[1];
        consumo = parseFloatSafe(matchStr) || 0;
      }
    }
    
    // Sometimes mortality is inside the recommendation string or missed
    if (mort === 0 && rec) {
      const mortMatch = rec.match(/mortalidade.*?(?:de\s+)?(\d+)/i);
      if (mortMatch) {
        mort = parseInt(mortMatch[1], 10);
      }
    }
    
    const getVal = (colIdx: number) => colIdx >= 0 ? parseFloatSafe(parts[colIdx]) : undefined;

    visits.push({
      id: `v_${id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${parsedCount}`,
      integradoId: id,
      date: finalDateStr,
      idade: calculatedIdade,
      animaisAlojados: getVal(columnMap.animaisAlojados),
      recomendacao: (rec || '').trim(),
      consumoAcumuladoReal: consumo, // Keep as legacy 
      mortalidade: mort,
      comedouro: parsedComedouro as 'Automático' | 'Linear' | 'Misto',
      colaborador: (colab || '').trim(),
      pesoAloj: parseFloatSafe(pesoAlojStr),
      pontuacaoSanitaria: parseInt((pontuacaoSanitariaStr || '').trim(), 10) || undefined,
      metaAlojamento: getVal(columnMap.metaAlojamento) ?? defaultMetas.metaAlojamento,
      consumoAlojamento: getVal(columnMap.consumoAlojamento),
      metaCrescimento1: getVal(columnMap.metaCrescimento1) ?? defaultMetas.metaCrescimento1,
      consumoCrescimento1: getVal(columnMap.consumoCrescimento1),
      metaCrescimento2: getVal(columnMap.metaCrescimento2) ?? defaultMetas.metaCrescimento2,
      consumoCrescimento2: getVal(columnMap.consumoCrescimento2),
      metaCrescimento3: getVal(columnMap.metaCrescimento3) ?? defaultMetas.metaCrescimento3,
      consumoCrescimento3: getVal(columnMap.consumoCrescimento3),
      metaTerminacao1: getVal(columnMap.metaTerminacao1) ?? defaultMetas.metaTerminacao1,
      consumoTerminacao1: getVal(columnMap.consumoTerminacao1),
      metaTerminacao2: getVal(columnMap.metaTerminacao2) ?? defaultMetas.metaTerminacao2,
      consumoTerminacao2: getVal(columnMap.consumoTerminacao2),
      metaAcumulada: getVal(columnMap.metaAcumulada) ?? defaultMetas.metaAcumulada,
    });
    
    // Special handling if real was parsed in a separate column
    if (columnMap.consumoAcumuladoReal >= 0) {
        const parsedReal = getVal(columnMap.consumoAcumuladoReal);
        if (parsedReal !== undefined) {
             visits[visits.length - 1].consumoAcumuladoReal = parsedReal;
        }
    }
    
    parsedCount++;
  }

  logs.push(`Pré-processamento concluído: ${parsedCount} registros válidos.`);
  
  return {
    integrados: Array.from(integradosMap.values()),
    visits,
    logs,
    errors
  };
}
