export interface Integrado {
  id: string;
  name: string;
  loteNumber?: string;
  alojamentoDate: string;
  status: 'Em andamento' | 'Fechado';
  fechamentoDate?: string;
}

export interface Visit {
  id: string;
  date: string;
  integradoId: string;
  idade: number; // in days
  recomendacao: string;
  consumoAcumuladoReal?: number;
  mortalidade?: number; // Historically used as percentage or absolute
  animaisAlojados?: number;
  animaisMortos?: number;
  comedouro: 'Linear' | 'Automático' | 'Misto';
  colaborador: string;
  consumoRacaoMeta?: string | Record<string, any>;
  pesoAloj?: number;
  pontuacaoSanitaria?: number;
  metaAlojamento?: number;
  consumoAlojamento?: number;
  metaCrescimento1?: number;
  consumoCrescimento1?: number;
  metaCrescimento2?: number;
  consumoCrescimento2?: number;
  metaCrescimento3?: number;
  consumoCrescimento3?: number;
  metaTerminacao1?: number;
  consumoTerminacao1?: number;
  metaTerminacao2?: number;
  consumoTerminacao2?: number;
  metaAcumulada?: number;
}

export interface GrowthCurvePoint {
  dia: number;
  pesoInicial: number;
  pesoFinal: number;
  cmd: number;
  consumoAcumulado: number;
  gpd: number;
}
