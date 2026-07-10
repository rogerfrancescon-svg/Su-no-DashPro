import { Integrado, Visit } from '../types';
import { defaultMetas, defaultMetasFemea } from '../data';

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

  // Detect delimiter
  let delimiter = '\t';
  const sampleFirstLines = lines.slice(0, 10).join('\n');
  if (sampleFirstLines.includes('\t')) delimiter = '\t';
  else if (sampleFirstLines.includes(';')) delimiter = ';';
  else if (sampleFirstLines.includes(',')) delimiter = ',';

  // Parse lines
  const parseLine = (text: string, delim: string) => {
    let result = [];
    let startValue = 0;
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '"') inQuotes = !inQuotes;
      else if (text[i] === delim && !inQuotes) {
        result.push(text.substring(startValue, i).replace(/^"|"$/g, '').trim());
        startValue = i + 1;
      }
    }
    result.push(text.substring(startValue).replace(/^"|"$/g, '').trim());
    return result;
  };

  const parsedLines = lines.map(line => {
    return parseLine(line.trim(), delimiter);
  }).filter(parts => parts.length > 0 && parts.some(p => p !== ''));

  if (parsedLines.length === 0) return { integrados: [], visits, logs, errors };

  // Find the header row dynamically (can be in the first 10 rows)
  let headerRowIndex = 0;
  let isHeader = false;
  
  for (let i = 0; i < Math.min(10, parsedLines.length); i++) {
    const lineLower = parsedLines[i].map(s => s.toLowerCase());
    if (lineLower.some(h => h.includes('data') || h.includes('integrado') || h.includes('nome'))) {
      headerRowIndex = i;
      isHeader = true;
      break;
    }
  }

  const headerLine = isHeader ? parsedLines[headerRowIndex].map(s => s.toLowerCase()) : parsedLines[0].map(s => s.toLowerCase());

  // Map to find columns
  const map: Record<string, number> = {};
  
  if (isHeader) {
    headerLine.forEach((h, i) => {
      const cleanH = h.replace(/[^a-z0-9]/g, '');
      if (cleanH === 'data' || cleanH === 'datavisita' || (cleanH.includes('data') && !cleanH.includes('alojamento'))) map.date = i;
      if (cleanH.includes('integrado') || cleanH.includes('nome')) map.name = i;
      if ((cleanH === 'alojamento' || cleanH === 'dataalojamento') || ((cleanH.includes('alojamento') || cleanH.includes('aloj')) && !cleanH.includes('meta') && !cleanH.includes('consumo') && !cleanH.includes('cons') && !cleanH.includes('peso') && !cleanH.includes('carga') && !cleanH.includes('animais'))) map.alojamento = i;
      if (cleanH === 'idade' || cleanH === 'idadedolote') map.idade = i;
      if (cleanH.includes('animaisalojados') || cleanH === 'alojados') map.animaisAlojados = i;
      if (cleanH.includes('animaismortos') || cleanH === 'mortos') map.animaisMortos = i;
      if (cleanH.includes('volcargas') || cleanH.includes('cargaenviada') || cleanH.includes('cargaskg')) map.volumeCargas = i;
      if (cleanH.includes('recomendao') || cleanH.includes('recomendacao')) map.recomendacao = i;
      if (cleanH.includes('consumoacumulado') || cleanH.includes('consumoacumuladoreal') || (cleanH.includes('consumo') && !cleanH.includes('aloj') && !cleanH.includes('cresc') && !cleanH.includes('term'))) map.consumoAcumuladoReal = i;
      if (cleanH === 'mortalidade' || cleanH === 'mort' || cleanH === 'mortalidade') map.mortalidade = i;
      if (cleanH.includes('comedouro')) map.comedouro = i;
      if (cleanH.includes('colaborador') || cleanH.includes('tecnico')) map.colaborador = i;
      
      if (cleanH.includes('metaalojamento') || cleanH.includes('metaaloj')) map.metaAlojamento = i;
      if (cleanH.includes('consumoalojamento') || cleanH.includes('consaloj')) map.consumoAlojamento = i;
      if (cleanH.includes('metacrescimento1') || cleanH.includes('metacresc1')) map.metaCrescimento1 = i;
      if (cleanH.includes('consumocrescimento1') || cleanH.includes('conscresc1')) map.consumoCrescimento1 = i;
      if (cleanH.includes('metacrescimento2') || cleanH.includes('metacresc2')) map.metaCrescimento2 = i;
      if (cleanH.includes('consumocrescimento2') || cleanH.includes('conscresc2')) map.consumoCrescimento2 = i;
      if (cleanH.includes('metacrescimento3') || cleanH.includes('metacresc3')) map.metaCrescimento3 = i;
      if (cleanH.includes('consumocrescimento3') || cleanH.includes('conscresc3')) map.consumoCrescimento3 = i;
      if (cleanH.includes('metaterminacao1') || cleanH.includes('metaterminao1') || cleanH.includes('metaterm1')) map.metaTerminacao1 = i;
      if (cleanH.includes('consumoterminacao1') || cleanH.includes('consumoterminao1') || cleanH.includes('consterm1')) map.consumoTerminacao1 = i;
      if (cleanH.includes('metaterminacao2') || cleanH.includes('metaterminao2') || cleanH.includes('metaterm2')) map.metaTerminacao2 = i;
      if (cleanH.includes('consumoterminacao2') || cleanH.includes('consumoterminao2') || cleanH.includes('consterm2')) map.consumoTerminacao2 = i;
      
      if (cleanH.includes('metaacumulada') || cleanH.includes('metaacum')) map.metaAcumulada = i;
      if (cleanH.includes('pesoaloj')) map.pesoAloj = i;
      if (cleanH.includes('pontuaosanitaria') || cleanH.includes('pontuacaosanitaria')) map.pontuacaoSanitaria = i;
    });
    
    logs.push(`Cabeçalho detectado e mapeado automaticamente (${Object.keys(map).length} colunas identificadas).`);

    // Validação de esquema rigorosa
        const requiredFields = [
      { key: 'date', label: 'Data' },
      { key: 'name', label: 'Integrado' },
      { key: 'alojamento', label: 'Alojamento' }
    ];

    const missingFields = requiredFields.filter(f => map[f.key] === undefined);
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(m => m.label).join(', ');
      const foundCols = Object.keys(map).join(', ');
      errors.push(`Erro de Validação: O esquema da planilha não corresponde exatamente ao formato esperado. Faltam as seguintes colunas: ${missingLabels}. Colunas mapeadas: ${foundCols || 'Nenhuma'}. Certifique-se que o cabeçalho contenha Data, Integrado e Alojamento.`);
      return { integrados: [], visits: [], logs, errors };
    }

  } else {
    // Fallback: fixed layout for old imports
    map.date = 0; map.name = 1; map.alojamento = 2; map.idade = 3; map.recomendacao = 4; map.consumoAcumuladoReal = 5; map.mortalidade = 6; map.comedouro = 7; map.colaborador = 8; map.pesoAloj = 10; map.pontuacaoSanitaria = 11;
  }

  let startIndex = isHeader ? headerRowIndex + 1 : 0;
  let parsedCount = 0;

  const parseFloatSafe = (valStr: string | undefined): number | undefined => {
    let clean = (valStr || '').trim();
    if (!clean || clean === '-' || clean === '') return undefined;
    
    // Remove " kg" or other units if present
    clean = clean.replace(/[^\d.,-]/g, '');

    if (clean.includes(',') && clean.includes('.')) {
      // 1.234,56 -> 1234.56
      const lastComma = clean.lastIndexOf(',');
      const lastDot = clean.lastIndexOf('.');
      if (lastComma > lastDot) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      // 123,45 -> 123.45
      clean = clean.replace(',', '.');
    } else if (clean.includes('.')) {
      // 10.000 -> 10000
      if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
         clean = clean.replace(/\./g, '');
      }
    }

    const val = parseFloat(clean);
    return isNaN(val) ? undefined : val;
  };

  const formatDate = (dStr: string) => {
    if (!dStr) return '';
    
    // Check if it's an Excel serial date (only numbers)
    if (/^\d{4,5}(\.\d+)?$/.test(dStr.trim())) {
      const serial = parseFloat(dStr.trim());
      // Excel epoch is 1899-12-30 (due to 1900 leap year bug)
      const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
      // JS uses UTC for these manual constructions to avoid timezone shifts
      const iso = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000)).toISOString();
      return iso.split('T')[0];
    }

    // Trim and take only the first part before space/T in case of ISO or timestamp
    dStr = dStr.trim().split(/[ T]/)[0];
    if (!dStr) return '';
    let parts: string[] = [];
    if (dStr.includes('-')) parts = dStr.split('-');
    else if (dStr.includes('/')) parts = dStr.split('/');
    
    if (parts.length !== 3) return dStr;
    
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    if (year.length !== 4 && parts[0].length === 4) year = parts[0];
    
    if (parts[0].length === 4) { // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else { // DD-MM-YYYY
      return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  };

  for (let i = startIndex; i < parsedLines.length; i++) {
    try {
      const parts = parsedLines[i];
    const originalLineIndex = i + 1;

    const getCol = (key: string) => map[key] !== undefined ? parts[map[key]] : undefined;

    let dateStr = getCol('date');
    let name = getCol('name');
    let alojamentoStr = getCol('alojamento');
    
    if (!dateStr || !name || !alojamentoStr) {
      errors.push(`Erro na linha ${originalLineIndex}: Falta campos obrigatórios. Data="${dateStr || ''}", Nome="${name || ''}", Alojamento="${alojamentoStr || ''}"`);
      continue;
    }

    const finalDateStr = formatDate(dateStr);
    const finalAlojamentoStr = formatDate(alojamentoStr);

    // Validate dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(finalDateStr)) {
      errors.push(`Erro na linha ${originalLineIndex}: Data da visita inválida (${dateStr})`);
      continue;
    }
    if (!dateRegex.test(finalAlojamentoStr)) {
      errors.push(`Erro na linha ${originalLineIndex}: Data de alojamento inválida (${alojamentoStr})`);
      continue;
    }

    // Calcular idade
    const pDate = new Date(finalDateStr + 'T12:00:00');
    const pAloj = new Date(finalAlojamentoStr + 'T12:00:00');
    const diffTime = pDate.getTime() - pAloj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const calculatedIdade = diffDays >= 0 ? diffDays : 0;

    const isClosed = calculatedIdade > 120;
    name = name.trim();

    const alojamentoStrClean = finalAlojamentoStr.replace(/[-/]/g, '');
    const id = `i_${name.replace(/\s+/g, '').toLowerCase()}_${alojamentoStrClean}`;
    
    if (!integradosMap.has(id)) {
      integradosMap.set(id, {
        id,
        name,
        alojamentoDate: finalAlojamentoStr,
        status: isClosed ? 'Fechado' : 'Em andamento'
      });
    } else if (isClosed) {
      const existing = integradosMap.get(id);
      if (existing) existing.status = 'Fechado';
    }

    let comedouro = getCol('comedouro');
    let parsedComedouro = 'Automático';
    const cLow = (comedouro || '').toLowerCase();
    if (cLow.includes('linear')) parsedComedouro = 'Linear';
    if (cLow.includes('misto')) parsedComedouro = 'Misto';

    let consumoStr = getCol('consumoAcumuladoReal');
    let consumo = parseFloatSafe(consumoStr) || 0;
    if (consumo < 0) consumo = 0;

    let mortStr = getCol('mortalidade');
    let mort = parseFloatSafe(mortStr) || 0;
    if (mort < 0) mort = 0;

    let rec = getCol('recomendacao');

    const tipoLoteRaw = (getCol('tipoLote') || 'Misto').trim();
    const tipoLote = tipoLoteRaw.toLowerCase().includes('f') ? 'Fêmea' : 'Misto';
    const metas = tipoLote === 'Fêmea' ? defaultMetasFemea : defaultMetas;

    visits.push({
      id: `v_${id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${parsedCount}`,
      integradoId: id,
      date: finalDateStr,
      idade: calculatedIdade,
      recomendacao: (rec || '').trim(),
      consumoAcumuladoReal: consumo,
      mortalidade: mort,
      comedouro: parsedComedouro as 'Automático' | 'Linear' | 'Misto',
      tipoLote,
      colaborador: (getCol('colaborador') || '').trim(),
      pesoAloj: parseFloatSafe(getCol('pesoAloj')),
      pontuacaoSanitaria: parseInt((getCol('pontuacaoSanitaria') || '').trim(), 10) || undefined,
      
      animaisAlojados: parseFloatSafe(getCol('animaisAlojados')),
      animaisMortos: parseFloatSafe(getCol('animaisMortos')) ?? mort,
      volumeTotalCargas: parseFloatSafe(getCol('volumeCargas')),

      metaAlojamento: parseFloatSafe(getCol('metaAlojamento')) ?? metas.metaAlojamento,
      consumoAlojamento: parseFloatSafe(getCol('consumoAlojamento')),
      metaCrescimento1: parseFloatSafe(getCol('metaCrescimento1')) ?? metas.metaCrescimento1,
      consumoCrescimento1: parseFloatSafe(getCol('consumoCrescimento1')),
      metaCrescimento2: parseFloatSafe(getCol('metaCrescimento2')) ?? metas.metaCrescimento2,
      consumoCrescimento2: parseFloatSafe(getCol('consumoCrescimento2')),
      metaCrescimento3: parseFloatSafe(getCol('metaCrescimento3')) ?? metas.metaCrescimento3,
      consumoCrescimento3: parseFloatSafe(getCol('consumoCrescimento3')),
      metaTerminacao1: parseFloatSafe(getCol('metaTerminacao1')) ?? metas.metaTerminacao1,
      consumoTerminacao1: parseFloatSafe(getCol('consumoTerminacao1')),
      metaTerminacao2: parseFloatSafe(getCol('metaTerminacao2')) ?? metas.metaTerminacao2,
      consumoTerminacao2: parseFloatSafe(getCol('consumoTerminacao2')),
      metaAcumulada: parseFloatSafe(getCol('metaAcumulada')) ?? metas.metaAcumulada
    });

      parsedCount++;
    } catch (e: any) {
      errors.push(`Erro inesperado na linha ${i + 1}: ${e.message}`);
    }
  }

  logs.push(`Pré-processamento concluído: ${parsedCount} registros válidos.`);

  return {
    integrados: Array.from(integradosMap.values()),
    visits,
    logs,
    errors
  };
}
