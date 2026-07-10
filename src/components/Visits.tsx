import React, { useState } from 'react';
import { Visit, Integrado } from '../types';
import { getExpectedConsumption } from '../data';
import { Search, ArrowUpDown, Download, Plus } from 'lucide-react';

interface VisitsListProps {
  visits: Visit[];
  integrados: Integrado[];
  onEditVisit: (id: string) => void;
  onDeleteVisit: (id: string) => void;
  onNewVisit?: () => void;
  onExport?: (data?: Visit[]) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'idade-desc' | 'idade-asc';

export function VisitsList({ visits, integrados, onEditVisit, onDeleteVisit, onNewVisit, onExport }: VisitsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getIntegradoName = (integradoId: string) => {
    return integrados.find(i => i.id === integradoId)?.name || '';
  };

  const sortedVisits = [...visits].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'name-asc':
        return getIntegradoName(a.integradoId).localeCompare(getIntegradoName(b.integradoId));
      case 'name-desc':
        return getIntegradoName(b.integradoId).localeCompare(getIntegradoName(a.integradoId));
      case 'idade-desc':
        return b.idade - a.idade;
      case 'idade-asc':
        return a.idade - b.idade;
      default:
        return 0;
    }
  });

  const filteredVisits = sortedVisits.filter(v => {
    const integrado = integrados.find(i => i.id === v.integradoId);
    return integrado?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           v.recomendacao.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded flex-1 sm:flex-none">
           <ArrowUpDown className="w-4 h-4" />
           <select 
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value as SortOption)}
             className="bg-transparent outline-none cursor-pointer text-slate-700 w-full"
           >
             <option value="date-desc">Data (Mais recentes)</option>
             <option value="date-asc">Data (Mais antigas)</option>
             <option value="name-asc">Nome (A-Z)</option>
             <option value="name-desc">Nome (Z-A)</option>
             <option value="idade-desc">Idade (Maior)</option>
             <option value="idade-asc">Idade (Menor)</option>
           </select>
         </div>
         <div className="relative w-full sm:max-w-md flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Buscar por cliente ou recomendação..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
           />
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
            {onExport && (
              <button 
                onClick={() => onExport && onExport(filteredVisits)} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">Exportar</span>
              </button>
            )}
            {onNewVisit && (
              <button onClick={onNewVisit} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-slate-900 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-slate-800 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Novo Lançamento</span>
              </button>
            )}
         </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        <div className="overflow-auto max-h-[calc(100vh-180px)]">
        <table className="w-full text-left text-sm text-slate-600 min-w-[3000px] relative">
          <thead className="bg-slate-50 text-slate-700 font-medium sticky top-0 z-20 shadow-sm">
            <tr>
                <th className="px-5 py-4 border-b border-slate-200">Data</th>
                <th className="px-5 py-4 border-b border-slate-200">Integrado</th>
                <th className="px-5 py-4 border-b border-slate-200">Alojamento</th>
                <th className="px-5 py-4 border-b border-slate-200">Idade</th>
                <th className="px-5 py-4 border-b border-slate-200">Animais Alojados</th>
                <th className="px-5 py-4 border-b border-slate-200">Animais Mortos</th>
                <th className="px-5 py-4 border-b border-slate-200">Vol. Cargas (kg)</th>
                <th className="px-5 py-4 border-b border-slate-200">Recomendação</th>
                <th className="px-5 py-4 border-b border-slate-200">Consumo acumulado</th>
                <th className="px-5 py-4 border-b border-slate-200">Comedouro</th>
                <th className="px-5 py-4 border-b border-slate-200">Colaborador</th>
                <th className="px-5 py-4 border-b border-slate-200">Meta Aloj</th>
                <th className="px-5 py-4 border-b border-slate-200">Cons. Aloj</th>
                <th className="px-5 py-4 border-b border-slate-200">Meta Cresc 1</th>
                <th className="px-5 py-4 border-b border-slate-200">Cons. Cresc 1</th>
                <th className="px-5 py-4 border-b border-slate-200">Meta Cresc 2</th>
                <th className="px-5 py-4 border-b border-slate-200">Cons. Cresc 2</th>
                <th className="px-5 py-4 border-b border-slate-200">Meta Cresc 3</th>
                <th className="px-5 py-4 border-b border-slate-200">Cons. Cresc 3</th>
                <th className="px-5 py-4 border-b border-slate-200">Meta Term 1</th>
                <th className="px-5 py-4 border-b border-slate-200">Cons. Term 1</th>
                <th className="px-5 py-4 border-b border-slate-200">Meta Term 2</th>
                <th className="px-5 py-4 border-b border-slate-200">Cons. Term 2</th>
                <th className="px-5 py-4 border-b border-slate-200">Meta Acum.</th>
                <th className="px-5 py-4 border-b border-slate-200">Peso aloj</th>
                <th className="px-5 py-4 border-b border-slate-200">Pontuação Sanitária</th>
                <th className="px-5 py-4 border-b border-slate-200 w-24 sticky right-0 top-0 bg-slate-50 z-30">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={27} className="px-5 py-8 text-center text-slate-500">Nenhuma visita encontrada.</td>
                </tr>
              ) : filteredVisits.map((v) => {
                const integrado = integrados.find(i => i.id === v.integradoId);
                const expected = getExpectedConsumption(v.idade);

                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">{
                      new Date(Number(v.date.split('-')[0]), Number(v.date.split('-')[1]) - 1, Number(v.date.split('-')[2])).toLocaleDateString('pt-BR')
                    }</td>
                    <td className="px-5 py-4 font-medium text-slate-800">{integrado?.name || 'Desconhecido'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{integrado?.alojamentoDate ? new Date(Number(integrado.alojamentoDate.split('-')[0]), Number(integrado.alojamentoDate.split('-')[1]) - 1, Number(integrado.alojamentoDate.split('-')[2])).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{v.idade}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{v.animaisAlojados ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{v.animaisMortos ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{v.volumeTotalCargas ?? '-'}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs leading-relaxed min-w-[300px] whitespace-pre-wrap" title={v.recomendacao}>
                        {v.recomendacao ? (
                          <div className="space-y-1">
                            {v.recomendacao.split('\n').filter(l => l.trim()).map((line, i) => (
                              <div key={i}>{line.replace(/^[-\*]\s*/, '').trim()}</div>
                            ))}
                          </div>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold">{v.consumoAcumuladoReal ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.comedouro || '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.colaborador ? v.colaborador.replace(/\s*,\s*/g, ' / ') : '-'}</td>
                    
                    {/* Metas e Consumos */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.metaAlojamento ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.consumoAlojamento ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.metaCrescimento1 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.consumoCrescimento1 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.metaCrescimento2 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.consumoCrescimento2 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.metaCrescimento3 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.consumoCrescimento3 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.metaTerminacao1 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.consumoTerminacao1 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.metaTerminacao2 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.consumoTerminacao2 ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold">{v.metaAcumulada ?? '-'}</td>
                    
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.pesoAloj ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.pontuacaoSanitaria ?? '-'}</td>
                    
                    <td className="px-5 py-4 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setDeleteConfirmId(null);
                            onEditVisit(v.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Editar
                        </button>
                        {deleteConfirmId === v.id ? (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => {
                                onDeleteVisit(v.id);
                                setDeleteConfirmId(null);
                              }}
                              className="text-white bg-red-500 hover:bg-red-600 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                            >
                              Sim
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-slate-600 bg-slate-200 hover:bg-slate-300 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirmId(v.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Apagar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
