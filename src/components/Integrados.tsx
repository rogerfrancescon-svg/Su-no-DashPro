import React, { useState } from 'react';
import { Integrado, Visit } from '../types';
import { getExpectedConsumption } from '../data';
import { Users, ClipboardList, Search, Filter, ArrowUpDown } from 'lucide-react';

interface IntegradosProps {
  integrados: Integrado[];
  visits: Visit[];
  totalVisits: number;
  onUpdate: (integrado: Integrado) => void;
  onDelete: (id: string) => void;
}

export function Integrados({ integrados, visits, totalVisits, onUpdate, onDelete }: IntegradosProps) {
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLoteNumber, setEditLoteNumber] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState<'Em andamento' | 'Fechado'>('Em andamento');
  const [editFechamentoDate, setEditFechamentoDate] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Em andamento' | 'Fechado'>('Todos');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

  const filteredIntegrados = [...integrados].filter(i => {
    if (filterStatus !== 'Todos' && i.status !== filterStatus) return false;
    if (searchTerm && !i.name.toLowerCase().includes(searchTerm.toLowerCase()) && !(i.loteNumber && i.loteNumber.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return new Date(b.alojamentoDate).getTime() - new Date(a.alojamentoDate).getTime();
      case 'date-asc': return new Date(a.alojamentoDate).getTime() - new Date(b.alojamentoDate).getTime();
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      default: return 0;
    }
  });


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Histórico de Lotes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Total Lotes: <strong className="text-slate-700">{integrados.length}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
            <ClipboardList className="w-4 h-4 text-emerald-500" />
            <span>Total Lançamentos: <strong className="text-slate-700">{totalVisits}</strong></span>
          </div>
        </div>
      </div>

      
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded flex-1 sm:flex-none">
          <Filter className="w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-transparent outline-none cursor-pointer text-slate-700 w-full"
          >
            <option value="Todos">Todos os status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Fechado">Fechado</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded flex-1 sm:flex-none">
          <ArrowUpDown className="w-4 h-4" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent outline-none cursor-pointer text-slate-700 w-full"
          >
            <option value="date-desc">Alojamento (Mais recente)</option>
            <option value="date-asc">Alojamento (Mais antigo)</option>
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
          </select>
        </div>
        <div className="relative w-full sm:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou lote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Lote</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Datas</th>
                <th className="px-6 py-4 text-right">Idade (Aprox)</th>
                <th className="px-6 py-4 text-right">Consumo Real (vs Alvo)</th>
                <th className="px-6 py-4 text-right">Mortalidade</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIntegrados.map(i => {
                const [aY, aM, aD] = i.alojamentoDate.split('-');
                const alojaDate = new Date(Number(aY), Number(aM) - 1, Number(aD));
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffTime = today.getTime() - alojaDate.getTime();
                const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
                
                const batchVisits = visits.filter(v => v.integradoId === i.id);
                const latestVisit = batchVisits.length > 0 ? batchVisits.reduce((prev, current) => (new Date(prev.date) > new Date(current.date)) ? prev : current) : null;
                
                let consumoStr = '-';
                let consumoColor = 'text-slate-500';
                let consumoBg = 'bg-slate-100';
                let diferencaStr = '';
                let mortalidadeStr = '-';
                let mortalidadeColor = 'text-slate-500';
                let mortalidadeBg = 'bg-slate-100';

                if (latestVisit) {
                  if (latestVisit.consumoAcumuladoReal !== undefined && latestVisit.consumoAcumuladoReal !== null && Number(latestVisit.consumoAcumuladoReal) > 0) {
                    const expected = getExpectedConsumption(Number(latestVisit.idade), latestVisit.tipoLote);
                    const realVal = Number(latestVisit.consumoAcumuladoReal);
                    const diff = realVal - expected;
                    consumoStr = `${realVal.toFixed(2)} kg`;
                    diferencaStr = diff > 0 ? `(+${diff.toFixed(2)} kg)` : `(${diff.toFixed(2)} kg)`;
                    if (diff >= -5 && diff <= 5) {
                      consumoColor = 'text-emerald-700';
                      consumoBg = 'bg-emerald-100';
                    } else if (diff > 5) {
                      consumoColor = 'text-blue-700';
                      consumoBg = 'bg-blue-100';
                    } else {
                      consumoColor = 'text-red-700';
                      consumoBg = 'bg-red-100';
                    }
                  }

                  let mortPerc = 0;
                  let hasMort = false;
                  const alojados = Number(latestVisit.animaisAlojados || 0);
                  if (alojados > 0) {
                    const mortos = latestVisit.animaisMortos !== undefined ? Number(latestVisit.animaisMortos) : Number(latestVisit.mortalidade || 0);
                    mortPerc = (mortos / alojados) * 100;
                    hasMort = true;
                  } else if (latestVisit.mortalidade !== undefined && latestVisit.mortalidade !== null) {
                    mortPerc = Number(latestVisit.mortalidade);
                    hasMort = true;
                  }

                  if (hasMort) {
                    mortalidadeStr = `${mortPerc.toFixed(2)}%`;
                    if (mortPerc <= 2.5) {
                      mortalidadeColor = 'text-emerald-700';
                      mortalidadeBg = 'bg-emerald-100';
                    } else if (mortPerc <= 4.0) {
                      mortalidadeColor = 'text-yellow-700';
                      mortalidadeBg = 'bg-yellow-100';
                    } else {
                      mortalidadeColor = 'text-red-700';
                      mortalidadeBg = 'bg-red-100';
                    }
                  }
                }
                
                return (
                  <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {editingId === i.id ? (
                        <input 
                          type="text" 
                          value={editLoteNumber}
                          onChange={e => setEditLoteNumber(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-blue-500"
                          placeholder="Nº"
                        />
                      ) : (
                        i.loteNumber || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {editingId === i.id ? (
                        <input 
                          type="text" 
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          {i.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === i.id ? (
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value as 'Em andamento' | 'Fechado')}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="Em andamento">Em andamento</option>
                          <option value="Fechado">Fechado</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${i.status === 'Fechado' ? 'bg-slate-100 text-slate-800' : 'bg-green-100 text-green-800'}`}>
                          {i.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === i.id ? (
                        <div className="flex flex-col gap-2">
                          <input 
                            type="date" 
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-blue-500"
                          />
                          {editStatus === 'Fechado' && (
                            <input 
                              type="date" 
                              value={editFechamentoDate}
                              onChange={e => setEditFechamentoDate(e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-blue-500"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col text-xs text-slate-500">
                          <span>Aloj: {new Date(Number(i.alojamentoDate.split('-')[0]), Number(i.alojamentoDate.split('-')[1]) - 1, Number(i.alojamentoDate.split('-')[2])).toLocaleDateString('pt-BR')}</span>
                          {i.status === 'Fechado' && i.fechamentoDate && (
                            <span>Fech: {new Date(Number(i.fechamentoDate.split('-')[0]), Number(i.fechamentoDate.split('-')[1]) - 1, Number(i.fechamentoDate.split('-')[2])).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span>{i.status === 'Fechado' && i.fechamentoDate 
                        ? `${Math.max(0, Math.round((new Date(Number(i.fechamentoDate.split('-')[0]), Number(i.fechamentoDate.split('-')[1]) - 1, Number(i.fechamentoDate.split('-')[2])).getTime() - new Date(Number(i.alojamentoDate.split('-')[0]), Number(i.alojamentoDate.split('-')[1]) - 1, Number(i.alojamentoDate.split('-')[2])).getTime()) / (1000 * 60 * 60 * 24)))} dias`
                        : `${diffDays} dias`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {latestVisit ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${consumoBg} ${consumoColor}`}>
                            {consumoStr}
                          </span>
                          {diferencaStr && (
                            <span className={`text-[10px] font-medium ${consumoColor.replace('700', '600')}`}>{diferencaStr}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {latestVisit ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${mortalidadeBg} ${mortalidadeColor}`}>
                          {mortalidadeStr}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {editingId === i.id ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              onUpdate({ 
                                ...i, 
                                name: editName, 
                                loteNumber: editLoteNumber, 
                                alojamentoDate: editDate,
                                status: editStatus,
                                fechamentoDate: editStatus === 'Fechado' ? editFechamentoDate : undefined
                              });
                              setEditingId(null);
                            }}
                            className="text-blue-600 font-semibold hover:text-blue-700 text-xs px-2 py-1 border border-blue-600 rounded"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="text-slate-500 font-semibold hover:text-slate-700 text-xs px-2 py-1 border border-slate-300 rounded"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-4">
                          <button 
                            onClick={() => {
                              setEditingId(i.id);
                              setEditName(i.name);
                              setEditLoteNumber(i.loteNumber || '');
                              setEditDate(i.alojamentoDate);
                              setEditStatus(i.status);
                              setEditFechamentoDate(i.fechamentoDate || '');
                              setDeleteConfirmId(null);
                            }}
                            className="text-blue-500 hover:text-blue-700 text-xs uppercase font-bold tracking-wider"
                          >
                            Editar
                          </button>
                          {deleteConfirmId === i.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-600 font-bold mr-1">Tem certeza?</span>
                              <button 
                                onClick={() => {
                                  onDelete(i.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="text-white bg-red-500 hover:bg-red-600 text-xs font-bold px-2 py-1 rounded"
                              >
                                Sim
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-slate-600 bg-slate-200 hover:bg-slate-300 text-xs font-bold px-2 py-1 rounded"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeleteConfirmId(i.id)}
                              className="text-red-500 hover:text-red-700 text-xs uppercase font-bold tracking-wider"
                            >
                              Apagar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredIntegrados.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Nenhum integrado cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
