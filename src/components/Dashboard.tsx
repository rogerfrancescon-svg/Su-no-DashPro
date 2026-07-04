import React, { useMemo, useState, useEffect } from 'react';
import { 
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceArea, LabelList
} from 'recharts';
import { Visit, Integrado } from '../types';
import { getExpectedConsumption } from '../data';
import { Filter, Calendar, Download, TrendingUp, TrendingDown, AlertTriangle, ArrowUpDown } from 'lucide-react';

interface DashboardProps {
  visits: Visit[];
  integrados: Integrado[];
}

export function Dashboard({ visits, integrados }: DashboardProps) {
  const [selectedIntegradoId, setSelectedIntegradoId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dotRadius = windowWidth >= 1024 ? 6 : 3;
  const activeDotRadius = windowWidth >= 1024 ? 9 : 5;

  // Process active integrados only based on status
  const activeIntegrados = useMemo(() => {
    return integrados.filter(i => i.status === 'Em andamento');
  }, [integrados]);

  const filteredIntegrados = useMemo(() => {
    if (selectedIntegradoId === 'all') return activeIntegrados;
    return activeIntegrados.filter(i => i.id === selectedIntegradoId);
  }, [activeIntegrados, selectedIntegradoId]);

  // Filter visits based on selected period
  const filteredVisits = useMemo(() => {
    let filtered = visits;
    
    if (selectedPeriod !== 'all') {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      
      filtered = visits.filter(v => {
        const visitDate = new Date(v.date);
        
        if (selectedPeriod === '7d') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return visitDate >= sevenDaysAgo && visitDate <= now;
        }
        
        if (selectedPeriod === '30d') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return visitDate >= thirtyDaysAgo && visitDate <= now;
        }

        if (selectedPeriod === 'this_month') {
          return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
        }

        if (selectedPeriod === 'last_month') {
          const lastMonth = new Date(now);
          lastMonth.setMonth(now.getMonth() - 1);
          return visitDate.getMonth() === lastMonth.getMonth() && visitDate.getFullYear() === lastMonth.getFullYear();
        }
        
        return true;
      });
    }

    return filtered.filter(v => filteredIntegrados.some(i => i.id === v.integradoId));
  }, [visits, filteredIntegrados, selectedPeriod]);

  // Process data for charts
  const chartData = useMemo(() => {
    // Generates points for the expected curve (weekly + end of batch)
    const ages = new Set<number>();
    for (let i = 1; i <= 100; i += 7) {
      ages.add(i);
    }
    ages.add(100);

    filteredVisits.forEach(v => ages.add(v.idade));

    const sortedAges = Array.from(ages).sort((a, b) => a - b);

    return sortedAges.map(idade => {
      const expected = getExpectedConsumption(idade);
      
      const visitsAtAge = filteredVisits.filter(v => v.idade === idade);
      const dataPoint: any = {
        idade,
        consumoEsperado: expected,
        consumoEsperadoRange: [Math.max(0, expected - 5), expected + 5]
      };
      
      visitsAtAge.forEach(v => {
        if (v.consumoAcumuladoReal && v.consumoAcumuladoReal > 0) {
          dataPoint[v.integradoId] = v.consumoAcumuladoReal;
        }
      });

      return dataPoint;
    });
  }, [filteredVisits]);

  // Data specifically for the Bar Chart (Latest visit per Integrado)
  const latestVisitsData = useMemo(() => {
    const latestVisitsMap = new Map<string, Visit>();
    filteredVisits.forEach(v => {
      if (!v.consumoAcumuladoReal || v.consumoAcumuladoReal === 0) return;
      const existing = latestVisitsMap.get(v.integradoId);
      if (!existing || new Date(v.date).getTime() > new Date(existing.date).getTime()) {
        latestVisitsMap.set(v.integradoId, v);
      }
    });

    return Array.from(latestVisitsMap.values()).map(v => {
      const integrado = filteredIntegrados.find(i => i.id === v.integradoId);
      const expected = getExpectedConsumption(v.idade);
      
      const abbreviateName = (name?: string) => {
        if (!name) return 'Desconhecido';
        const parts = name.trim().split(' ');
        if (parts.length > 1) {
          return `${parts[0]} ${parts[parts.length - 1][0]}.`;
        }
        return name;
      };

      return {
        id: v.id,
        integradoId: v.integradoId,
        name: integrado ? abbreviateName(integrado.name) : 'Desconhecido',
        fullName: integrado?.name || 'Desconhecido',
        date: v.date,
        idade: v.idade,
        consumoReal: v.consumoAcumuladoReal,
        consumoEsperado: expected,
        diferenca: Number((v.consumoAcumuladoReal - expected).toFixed(2)),
        mortalidade: v.mortalidade,
        animaisMortos: v.animaisMortos,
        animaisAlojados: v.animaisAlojados,
      };
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'diferenca-desc':
          return b.diferenca - a.diferenca;
        case 'diferenca-asc':
          return a.diferenca - b.diferenca;
        case 'idade-desc':
          return b.idade - a.idade;
        case 'idade-asc':
          return a.idade - b.idade;
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [filteredVisits, filteredIntegrados, sortBy]);

  const stats = useMemo(() => {
    const totalIntegrados = filteredIntegrados.length;
    // Count alerts only on latest visits
    const alertCount = latestVisitsData.filter(d => d.diferenca < -5 || d.diferenca > 5).length;
    const avgMortalidade = (() => {
      let totalMortos = 0;
      let totalAlojados = 0;
      let sumPercentages = 0;
      let countPercentages = 0;

      latestVisitsData.forEach(d => {
        const mortos = d.animaisMortos !== undefined ? d.animaisMortos : (d.mortalidade || 0);
        const alojados = d.animaisAlojados || 0;
        
        if (alojados > 0) {
          totalMortos += mortos;
          totalAlojados += alojados;
        } else if (d.mortalidade !== undefined) {
          sumPercentages += d.mortalidade;
          countPercentages++;
        }
      });
      
      if (totalAlojados > 0) {
        return (totalMortos / totalAlojados) * 100;
      } else if (countPercentages > 0) {
        return sumPercentages / countPercentages;
      }
      return 0;
    })();
    const avgDiferenca = latestVisitsData.length > 0
      ? latestVisitsData.reduce((acc, curr) => acc + curr.diferenca, 0) / latestVisitsData.length
      : 0;
    
    return { totalIntegrados, alertCount, avgMortalidade, avgDiferenca };
  }, [latestVisitsData, filteredIntegrados.length, filteredVisits]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard de Consumo</h1>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-slate-700 font-medium w-full"
            >
              <option value="name-asc">Nome (A-Z)</option>
              <option value="name-desc">Nome (Z-A)</option>
              <option value="diferenca-asc">Desvio (Menor p/ Maior)</option>
              <option value="diferenca-desc">Desvio (Maior p/ Menor)</option>
              <option value="idade-desc">Idade (Maior)</option>
              <option value="idade-asc">Idade (Menor)</option>
            </select>
          </div>
          <div className="relative w-full md:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 font-medium shadow-sm"
            >
              <option value="all">Todo o Período</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="this_month">Este mês</option>
              <option value="last_month">Mês passado</option>
            </select>
          </div>
          
          <div className="relative w-full md:w-56">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedIntegradoId}
              onChange={(e) => setSelectedIntegradoId(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 font-medium shadow-sm"
            >
              <option value="all">Todos os Clientes (Ativos)</option>
              {activeIntegrados.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Integrados</p>
            <p className="text-3xl font-bold text-slate-800">{stats.totalIntegrados}</p>
          </div>
          <p className="text-xs text-blue-600 font-medium mt-3">Lotes em andamento</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Alertas</p>
              {stats.alertCount > 0 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
            </div>
            <p className="text-3xl font-bold text-slate-800">{stats.alertCount}</p>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-3">Desvios &gt; 5kg na última visita</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Desvio Médio Geral</p>
            <p className={`text-3xl font-bold flex items-center gap-2 ${stats.avgDiferenca > 0 ? 'text-blue-600' : stats.avgDiferenca < 0 ? 'text-red-500' : 'text-slate-800'}`}>
              {stats.avgDiferenca > 0 ? <TrendingUp className="w-6 h-6" /> : stats.avgDiferenca < 0 ? <TrendingDown className="w-6 h-6" /> : null}
              {stats.avgDiferenca > 0 ? '+' : ''}{stats.avgDiferenca.toFixed(1)} kg
            </p>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-3">Em relação à curva alvo</p>
        </div>

        <div className="bg-blue-600 rounded-xl p-5 shadow-lg text-white flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-blue-100 uppercase mb-1">Média Mortalidade</p>
            <p className="text-3xl font-bold">{stats.avgMortalidade.toFixed(2)}%</p>
          </div>
          <p className="text-xs text-blue-200 font-medium mt-3">Média dos lotes em andamento</p>
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] lg:h-[500px] xl:h-[600px] min-w-0">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Consumo Real vs Tabela (por Idade)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 35, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="idade" type="number" domain={[1, 100]} tickCount={10} label={{ value: 'Idade (Dias)', position: 'insideBottom', offset: -15 }} stroke="#64748b" fontSize={12} />
              <YAxis label={{ value: 'Consumo (kg)', angle: -90, position: 'insideLeft' }} stroke="#64748b" fontSize={12} />
              
              {/* Fases de Ração */}
              {/* @ts-ignore */}
              <ReferenceArea x1={1} x2={14} fill="#f1f5f9" fillOpacity={0.5} label={{ value: 'Aloj', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
              {/* @ts-ignore */}
              <ReferenceArea x1={14} x2={32} fill="#e2e8f0" fillOpacity={0.5} label={{ value: 'C1', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
              {/* @ts-ignore */}
              <ReferenceArea x1={32} x2={46} fill="#cbd5e1" fillOpacity={0.5} label={{ value: 'C2', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
              {/* @ts-ignore */}
              <ReferenceArea x1={46} x2={64} fill="#f1f5f9" fillOpacity={0.5} label={{ value: 'C3', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
              {/* @ts-ignore */}
              <ReferenceArea x1={64} x2={74} fill="#e2e8f0" fillOpacity={0.5} label={{ value: 'T1', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
              {/* @ts-ignore */}
              <ReferenceArea x1={74} x2={96} fill="#cbd5e1" fillOpacity={0.5} label={{ value: 'T2', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />

              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label) => `Idade: ${label} dias`} 
                formatter={(value: number | [number, number], name: string) => {
                  if (Array.isArray(value)) {
                    return [`${value[0].toFixed(2)} - ${value[1].toFixed(2)} kg`, name];
                  }
                  return [`${value.toFixed(2)} kg`, name];
                }}
              />
              {filteredIntegrados.length <= 4 && (
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  payload={[
                    { value: 'Curva Alvo', type: 'circle', id: 'consumoEsperado', color: '#94a3b8' },
                    ...Array.from(new Map(filteredIntegrados.map((integrado, index) => {
                      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
                      const abbreviateName = (name?: string) => {
                        if (!name) return 'Desconhecido';
                        const parts = name.trim().split(' ');
                        if (parts.length > 1) {
                          return `${parts[0]} ${parts[parts.length - 1][0]}.`;
                        }
                        return name;
                      };
                      const name = abbreviateName(integrado.name);
                      return [name, {
                        value: name,
                        type: 'circle',
                        id: integrado.id,
                        color: colors[index % colors.length]
                      }];
                    })).values()) as any[]
                  ]}
                />
              )}
              <Area type="monotone" dataKey="consumoEsperadoRange" name="Margem de Erro (±5kg)" stroke="none" fill="#cbd5e1" fillOpacity={0.3} activeDot={false} />
              <Line type="monotone" dataKey="consumoEsperado" name="Curva Alvo" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              {filteredIntegrados.map((integrado, index) => {
                const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
                
                const abbreviateName = (name?: string) => {
                  if (!name) return 'Desconhecido';
                  const parts = name.trim().split(' ');
                  if (parts.length > 1) {
                    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
                  }
                  return name;
                };

                return (
                  <Line 
                    key={integrado.id} 
                    type="monotone" 
                    dataKey={integrado.id} 
                    name={abbreviateName(integrado.name)} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2} 
                    dot={{ r: dotRadius }} 
                    activeDot={{ r: activeDotRadius }} 
                    connectNulls={true} 
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] min-w-0">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Desvio de Consumo por Lote (Última Visita)</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latestVisitsData} margin={{ top: 5, right: 20, bottom: 50, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(2)} kg`, 'Diferença']}
                />
                <Bar dataKey="diferenca" name="Diferença vs Alvo" radius={[4, 4, 0, 0]}>
                  {
                    latestVisitsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(entry.diferenca >= -5 && entry.diferenca <= 5) ? '#10b981' : entry.diferenca < 0 ? '#ef4444' : '#3b82f6'} />
                    ))
                  }
                  <LabelList 
                    dataKey="diferenca" 
                    position="top" 
                    fill="#64748b" 
                    fontSize={10} 
                    fontWeight={500}
                    formatter={(val: number) => val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col min-w-0">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Resumo da Última Visita (Tabela)</h2>
            <div className="flex-1 overflow-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Lote</th>
                    <th className="px-4 py-3 font-semibold text-center">Idade</th>
                    <th className="px-4 py-3 font-semibold text-right">Consumo Real</th>
                    <th className="px-4 py-3 font-semibold text-right">Desvio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestVisitsData.length > 0 ? (
                    latestVisitsData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{row.name}</td>
                        <td className="px-4 py-3 text-slate-600 text-center">{row.idade} d</td>
                        <td className="px-4 py-3 text-slate-600 text-right font-medium">{row.consumoReal.toFixed(2)} kg</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            (row.diferenca >= -5 && row.diferenca <= 5) ? 'bg-emerald-100 text-emerald-700' : row.diferenca > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {row.diferenca > 0 ? '+' : ''}{row.diferenca.toFixed(2)} kg
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        Nenhum dado encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

