const XLSX = require('xlsx');

const visits = [
  {
    date: '2023-05-15',
    integradoId: '1',
    idade: 25,
    animaisAlojados: 10000,
    recomendacao: 'none',
    consumoAcumuladoReal: 50,
    animaisMortos: 10,
    comedouro: 'A',
    colaborador: 'John Doe',
    metaAlojamento: 1,
    consumoAlojamento: 2,
    metaCrescimento1: 3,
    consumoCrescimento1: 4,
    metaCrescimento2: 5,
    consumoCrescimento2: 6,
    metaCrescimento3: 7,
    consumoCrescimento3: 8,
    metaTerminacao1: 9,
    consumoTerminacao1: 10,
    metaTerminacao2: 11,
    consumoTerminacao2: 12,
    metaAcumulada: 13,
    pesoAloj: 40,
    pontuacaoSanitaria: 'A'
  }
];

const integrados = [
  { id: '1', name: 'Test', alojamentoDate: '2023-04-20' }
];

const dataToExport = visits.map(v => {
  const integrado = integrados.find(i => i.id === v.integradoId);
  const dataFormatada = v.date ? new Date(Number(v.date.split('-')[0]), Number(v.date.split('-')[1]) - 1, Number(v.date.split('-')[2])).toLocaleDateString('pt-BR') : '';
  
  return {
    'Data': dataFormatada,
    'Integrado': integrado?.name || '',
    'Alojamento': integrado?.alojamentoDate ? new Date(Number(integrado.alojamentoDate.split('-')[0]), Number(integrado.alojamentoDate.split('-')[1]) - 1, Number(integrado.alojamentoDate.split('-')[2])).toLocaleDateString('pt-BR') : '',
    'Idade': v.idade,
    'Animais Alojados': v.animaisAlojados || '',
    'Recomendação': v.recomendacao || '',
    'Consumo acumulado': v.consumoAcumuladoReal ?? '',
    'Animais Mortos': v.animaisMortos ?? '',
    'Comedouro': v.comedouro || '',
    'Colaborador': v.colaborador ? v.colaborador.replace(/\s*,\s*/g, ' / ') : '',
    'Meta Aloj': v.metaAlojamento || '',
    'Cons. Aloj': v.consumoAlojamento || '',
    'Meta Cresc 1': v.metaCrescimento1 || '',
    'Cons. Cresc 1': v.consumoCrescimento1 || '',
    'Meta Cresc 2': v.metaCrescimento2 || '',
    'Cons. Cresc 2': v.consumoCrescimento2 || '',
    'Meta Cresc 3': v.metaCrescimento3 || '',
    'Cons. Cresc 3': v.consumoCrescimento3 || '',
    'Meta Term 1': v.metaTerminacao1 || '',
    'Cons. Term 1': v.consumoTerminacao1 || '',
    'Meta Term 2': v.metaTerminacao2 || '',
    'Cons. Term 2': v.consumoTerminacao2 || '',
    'Cons. Acum. Real': v.consumoAcumuladoReal ?? '',
    'Meta Acum.': v.metaAcumulada || '',
    'Peso aloj': v.pesoAloj || '',
    'Pontuação Sanitária': v.pontuacaoSanitaria || '',
  };
});

const worksheet = XLSX.utils.json_to_sheet(dataToExport);
console.log(worksheet);
