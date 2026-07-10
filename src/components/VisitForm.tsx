import React, { useState } from 'react';
import { Visit, Integrado } from '../types';
import { growthCurve, getExpectedConsumption } from '../data';
import { Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface VisitaFormProps {
  integrados: Integrado[];
  visits?: Visit[];
  initialData?: Visit;
  onSave: (visit: Visit, integradoNome?: string, alojamentoDate?: string) => void;
  onCancel?: () => void;
}

export function VisitaForm({ integrados, visits = [], initialData, onSave, onCancel }: VisitaFormProps) {
  const [formData, setFormData] = useState<Partial<Visit> & { alojamentoDate?: string, integradoNome?: string }>(() => {
    const defaultMetas = {
      metaAlojamento: 17.00,
      metaCrescimento1: 30.82,
      metaCrescimento2: 30.67,
      metaCrescimento3: 45.71,
      metaTerminacao1: 27.49,
      metaTerminacao2: 63.15,
      metaAcumulada: 214.85
    };

    if (initialData) {
      const integrado = integrados.find(i => i.id === initialData.integradoId);
      return {
        ...initialData,
        metaAlojamento: initialData.metaAlojamento ?? defaultMetas.metaAlojamento,
        metaCrescimento1: initialData.metaCrescimento1 ?? defaultMetas.metaCrescimento1,
        metaCrescimento2: initialData.metaCrescimento2 ?? defaultMetas.metaCrescimento2,
        metaCrescimento3: initialData.metaCrescimento3 ?? defaultMetas.metaCrescimento3,
        metaTerminacao1: initialData.metaTerminacao1 ?? defaultMetas.metaTerminacao1,
        metaTerminacao2: initialData.metaTerminacao2 ?? defaultMetas.metaTerminacao2,
        metaAcumulada: initialData.metaAcumulada ?? defaultMetas.metaAcumulada,
        alojamentoDate: integrado?.alojamentoDate,
        integradoNome: integrado?.name
      };
    }
    return {
      ...defaultMetas,
      date: new Date().toISOString().split('T')[0],
      comedouro: 'Linear',
      colaborador: 'Wagner'
    };
  });

  const [saving, setSaving] = useState(false);

  const [outrosColab, setOutrosColab] = useState(() => {
    if (!initialData || !initialData.colaborador) return '';
    const current = initialData.colaborador.split(/\s*[,/;-]\s*/).filter(Boolean);
    const predefined = ['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'];
    return current.filter(c => !predefined.includes(c)).join(' / ');
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { alojamentoDate, integradoNome, ...visitData } = formData;
    const integradoId = `i_${(integradoNome || '').replace(/\s+/g, '').toLowerCase()}_${(alojamentoDate || '').replace(/[-/]/g, '')}`;
    onSave({
      ...visitData,
      id: initialData ? initialData.id : `v_${integradoId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      integradoId,
      idade: Number(visitData.idade) || 0,
      consumoAcumuladoReal: visitData.consumoAcumuladoReal ? Number(visitData.consumoAcumuladoReal) : undefined,
      mortalidade: visitData.mortalidade !== undefined && visitData.mortalidade !== null ? Number(visitData.mortalidade) : undefined,
      animaisAlojados: visitData.animaisAlojados ? Number(visitData.animaisAlojados) : undefined,
      animaisMortos: visitData.animaisMortos ? Number(visitData.animaisMortos) : undefined,
      volumeTotalCargas: visitData.volumeTotalCargas ? Number(visitData.volumeTotalCargas) : undefined,
      pesoAloj: visitData.pesoAloj ? Number(visitData.pesoAloj) : undefined,
      pontuacaoSanitaria: visitData.pontuacaoSanitaria ? Number(visitData.pontuacaoSanitaria) : undefined,
    } as Visit, integradoNome, alojamentoDate);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let updates: any = { [name]: value };
    
    if (name === 'integradoNome') {
      const integrado = integrados.find(i => i.name.toLowerCase() === value.toLowerCase());
      if (integrado) {
        updates.alojamentoDate = integrado.alojamentoDate;
        
        // Find previous visits for this integrado to auto-fill animaisAlojados and animaisMortos
        const integradoVisits = visits.filter(v => v.integradoId === integrado.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (integradoVisits.length > 0) {
          const lastVisit = integradoVisits[0];
          if (lastVisit.animaisAlojados) updates.animaisAlojados = lastVisit.animaisAlojados;
          if (lastVisit.animaisMortos) updates.animaisMortos = lastVisit.animaisMortos;
          if (lastVisit.mortalidade) updates.mortalidade = lastVisit.mortalidade;
          ['pesoAloj', 'pontuacaoSanitaria', 'cargaAlojamento', 'consumoAlojamento', 'cargaCrescimento1', 'consumoCrescimento1', 'cargaCrescimento2', 'consumoCrescimento2', 'cargaCrescimento3', 'consumoCrescimento3', 'cargaTerminacao1', 'consumoTerminacao1', 'cargaTerminacao2', 'consumoTerminacao2', 'volumeTotalCargas', 'consumoAcumuladoReal'].forEach(key => {
            if (lastVisit[key as keyof typeof lastVisit] !== undefined && lastVisit[key as keyof typeof lastVisit] !== null) updates[key] = lastVisit[key as keyof typeof lastVisit];
          });
        }
      }
    }
    
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      // Auto-calculate consumoAcumuladoReal based on volumeTotalCargas
      
      // Auto-calculate consumos when cargas change or mortos change
      const alojados = Number(newData.animaisAlojados) || 0;
      const mortos = Number(newData.animaisMortos) || 0;
      const vivos = alojados - mortos;
      
      if (alojados > 0) {
        newData.mortalidade = Number(((mortos / alojados) * 100).toFixed(2));
      } else {
        newData.mortalidade = undefined;
      }
      
      if (vivos > 0) {
        if (newData.cargaAlojamento) newData.consumoAlojamento = Number((Number(newData.cargaAlojamento) / vivos).toFixed(2));
        if (newData.cargaCrescimento1) newData.consumoCrescimento1 = Number((Number(newData.cargaCrescimento1) / vivos).toFixed(2));
        if (newData.cargaCrescimento2) newData.consumoCrescimento2 = Number((Number(newData.cargaCrescimento2) / vivos).toFixed(2));
        if (newData.cargaCrescimento3) newData.consumoCrescimento3 = Number((Number(newData.cargaCrescimento3) / vivos).toFixed(2));
        if (newData.cargaTerminacao1) newData.consumoTerminacao1 = Number((Number(newData.cargaTerminacao1) / vivos).toFixed(2));
        if (newData.cargaTerminacao2) newData.consumoTerminacao2 = Number((Number(newData.cargaTerminacao2) / vivos).toFixed(2));
        
        // volumeTotalCargas is now the sum of all specific cargas if not explicitly overridden, or we can just calculate it:
        const sumCargas = (Number(newData.cargaAlojamento) || 0) + (Number(newData.cargaCrescimento1) || 0) + (Number(newData.cargaCrescimento2) || 0) + (Number(newData.cargaCrescimento3) || 0) + (Number(newData.cargaTerminacao1) || 0) + (Number(newData.cargaTerminacao2) || 0);
        
        if (sumCargas > 0 && !['volumeTotalCargas', 'consumoAcumuladoReal'].includes(name)) {
           newData.volumeTotalCargas = sumCargas;
           newData.consumoAcumuladoReal = Number((sumCargas / vivos).toFixed(2));
        } else {
           const volume = Number(newData.volumeTotalCargas) || 0;
           if (volume > 0) {
             newData.consumoAcumuladoReal = Number((volume / vivos).toFixed(2));
           } else if (name === 'volumeTotalCargas' && !newData.volumeTotalCargas) {
             newData.consumoAcumuladoReal = undefined;
           }
        }
      }

      if ((name === 'date' || name === 'alojamentoDate' || name === 'integradoNome') && newData.date && newData.alojamentoDate) {
         const [vY, vM, vD] = newData.date.split('-');
         const [aY, aM, aD] = newData.alojamentoDate.split('-');
         const visitDate = new Date(Number(vY), Number(vM) - 1, Number(vD));
         const alojamentoDate = new Date(Number(aY), Number(aM) - 1, Number(aD));
         
         const diffTime = visitDate.getTime() - alojamentoDate.getTime();
         const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
         newData.idade = diffDays >= 0 ? diffDays + 1 : 1;
      }
      return newData;
    });
  };

  const currentIdade = Number(formData.idade) || 0;
  const expectedConsumption = currentIdade > 0 ? getExpectedConsumption(currentIdade) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="px-6 py-5 border-b border-slate-200">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          {initialData ? 'Editar Lançamento' : 'Novo Lançamento Rápido'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Data da Visita</label>
            <input 
              type="date" 
              name="date"
              required
              value={formData.date || ''}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Integrado (Nome)</label>
            <input 
              type="text"
              name="integradoNome"
              list="integrados-list"
              required
              value={formData.integradoNome || ''}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <datalist id="integrados-list">
              {Array.from(new Set(integrados.map(i => i.name))).map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Alojamento</label>
            <input 
              type="date" 
              name="alojamentoDate"
              required
              value={formData.alojamentoDate || ''}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {formData.integradoNome && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col md:flex-row md:justify-between items-center text-sm -mt-2">
             <div className="flex flex-col gap-1 text-slate-600">
                <span className="font-medium text-slate-800 mb-1">Resumo Automático do Lote</span>
                <span className="flex items-center gap-2">Idade calculada: <strong className="text-blue-900">{currentIdade} dias</strong></span>
                <span className="flex items-center gap-2">Animais Vivos: <strong className="text-blue-900">{(Number(formData.animaisAlojados) || 0) - (Number(formData.animaisMortos) || 0)}</strong> <span className="text-xs text-slate-500">({formData.animaisAlojados || 0} alojados)</span></span>
             </div>
             <div className="flex flex-col gap-1 text-slate-600 md:text-right mt-3 md:mt-0">
                <span className="flex items-center gap-2 justify-end">Consumo Esperado: <strong className="text-blue-900">{expectedConsumption || '-'} kg/cab</strong></span>
                <span className="flex items-center gap-2 justify-end">Consumo Real (Calculado): <strong className={formData.consumoAcumuladoReal && expectedConsumption && formData.consumoAcumuladoReal < expectedConsumption ? 'text-red-600' : 'text-green-600'}>{formData.consumoAcumuladoReal || '-'} kg/cab</strong></span>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Idade (Dias)</label>
            <input 
              type="number" 
              name="idade"
              min="1"
              max="150"
              required
              value={formData.idade || ''}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Animais Alojados</label>
            <input 
              type="number" 
              name="animaisAlojados"
              value={formData.animaisAlojados || ''}
              onChange={handleChange}
              placeholder="Ex: 1000"
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex justify-between items-center">
              <span>Animais Mortos</span>
              {formData.mortalidade !== undefined && formData.mortalidade !== null && !isNaN(Number(formData.mortalidade)) && (
                <span className="flex items-center gap-2"><span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">{(Number(formData.animaisAlojados) || 0) - (Number(formData.animaisMortos) || 0)} vivos</span><span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px]">{formData.mortalidade}%</span></span>
              )}
            </label>
            <input 
              type="number" 
              name="animaisMortos"
              value={formData.animaisMortos ?? ''}
              onChange={handleChange}
              placeholder="Ex: 5"
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Comedouro</label>
            <select 
              name="comedouro"
              value={formData.comedouro || ''}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Linear">Linear</option>
              <option value="Automático">Automático</option>
              <option value="Misto">Misto</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Aloj (kg)</label>
            <input 
              type="number" 
              step="0.01"
              name="pesoAloj"
              value={formData.pesoAloj || ''}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Pontuação Sanitária</label>
            <input 
              type="number" 
              name="pontuacaoSanitaria"
              value={formData.pontuacaoSanitaria || ''}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Recomendações e Observações do Lote</label>
            <textarea 
              name="recomendacao"
              required
              rows={3}
              value={formData.recomendacao || ''}
              onChange={handleChange}
              placeholder="Ex: Lote com consumo abaixo da tabela..."
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-700">Lançamento de Cargas e Consumo (kg)</h3>
          <div className="overflow-x-auto w-full -ml-2 -mr-2 md:mx-0 pr-4 md:pr-0">
            <table className="w-full text-sm text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-2 md:pr-4 pl-2 font-semibold text-slate-500 uppercase text-[10px]">Fase</th>
                  <th className="py-2 pr-2 md:pr-4 font-semibold text-slate-500 uppercase text-[10px] w-1/4">Carga Total (kg)</th>
                  <th className="py-2 pr-2 md:pr-4 font-semibold text-slate-500 uppercase text-[10px] w-1/4">Cons. Real (kg/cab)</th>
                  <th className="py-2 pr-2 md:pr-4 font-semibold text-slate-500 uppercase text-[10px]">Meta Ref. (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'Alojamento', label: 'Alojamento', metaKey: 'metaAlojamento', cargaKey: 'cargaAlojamento', consKey: 'consumoAlojamento' },
                  { id: 'Crescimento1', label: 'Crescimento 1', metaKey: 'metaCrescimento1', cargaKey: 'cargaCrescimento1', consKey: 'consumoCrescimento1' },
                  { id: 'Crescimento2', label: 'Crescimento 2', metaKey: 'metaCrescimento2', cargaKey: 'cargaCrescimento2', consKey: 'consumoCrescimento2' },
                  { id: 'Crescimento3', label: 'Crescimento 3', metaKey: 'metaCrescimento3', cargaKey: 'cargaCrescimento3', consKey: 'consumoCrescimento3' },
                  { id: 'Terminacao1', label: 'Terminação 1', metaKey: 'metaTerminacao1', cargaKey: 'cargaTerminacao1', consKey: 'consumoTerminacao1' },
                  { id: 'Terminacao2', label: 'Terminação 2', metaKey: 'metaTerminacao2', cargaKey: 'cargaTerminacao2', consKey: 'consumoTerminacao2' },
                ].map((phase) => (
                  <tr key={phase.id} className="hover:bg-slate-50">
                    <td className="py-2 pr-2 md:pr-4 pl-2 font-medium text-slate-700 text-xs md:text-sm">{phase.label}</td>
                    <td className="py-2 pr-2 md:pr-4">
                      <input type="number" step="0.01" name={phase.cargaKey} value={(formData as any)[phase.cargaKey] || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                    </td>
                    <td className="py-2 pr-2 md:pr-4">
                      <input type="number" step="0.01" name={phase.consKey} value={(formData as any)[phase.consKey] || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-xs md:text-sm bg-slate-50 text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" readOnly placeholder="0.00" />
                    </td>
                    <td className="py-2 pr-2 md:pr-4 text-slate-500 text-xs md:text-sm">
                      {(formData as any)[phase.metaKey] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 font-semibold bg-slate-50">
                <tr>
                  <td className="py-3 pr-2 md:pr-4 pl-2 text-slate-700 text-xs md:text-sm">TOTAL ACUMULADO</td>
                  <td className="py-3 pr-2 md:pr-4">
                    <input type="number" step="0.01" name="volumeTotalCargas" value={formData.volumeTotalCargas || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-xs md:text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                  </td>
                  <td className="py-3 pr-2 md:pr-4">
                    <input type="number" step="0.01" name="consumoAcumuladoReal" value={formData.consumoAcumuladoReal || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-xs md:text-sm font-bold bg-slate-100 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" readOnly placeholder="0.00" />
                  </td>
                  <td className="py-3 pr-2 md:pr-4 text-slate-500 text-xs md:text-sm">
                    {formData.metaAcumulada || '-'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-2">Técnico/Colaborador</label>
            <div className="flex flex-wrap gap-2">
              {['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'].map(colab => {
                const current = formData.colaborador ? formData.colaborador.split(/\s*[,/;-]\s*/).filter(Boolean) : [];
                const isSelected = current.includes(colab);
                return (
                  <button
                    key={colab}
                    type="button"
                    onClick={() => {
                      const predefined = ['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'];
                      const currentSelected = formData.colaborador ? formData.colaborador.split(/\s*[,/;-]\s*/).filter(Boolean).filter(c => predefined.includes(c)) : [];
                      let newSelected;
                      if (!isSelected) {
                        newSelected = [...currentSelected, colab];
                      } else {
                        newSelected = currentSelected.filter(c => c !== colab);
                      }
                      const typed = outrosColab.split(/\s*[,/;-]\s*/).filter(Boolean);
                      setFormData(prev => ({ ...prev, colaborador: [...newSelected, ...typed].join(' / ') }));
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {colab}
                  </button>
                )
              })}
            </div>
            <input 
              type="text"
              placeholder="Outros (separe por barra)"
              value={outrosColab}
              onChange={(e) => {
                 const val = e.target.value;
                 setOutrosColab(val);
                 const predefined = ['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'];
                 const currentSelected = formData.colaborador ? formData.colaborador.split(/\s*[,/;-]\s*/).filter(Boolean).filter(c => predefined.includes(c)) : [];
                 const typed = val.split(/\s*[,/;-]\s*/).filter(Boolean);
                 setFormData(prev => ({ ...prev, colaborador: [...currentSelected, ...typed].join(' / ') }));
              }}
              onBlur={() => {
                 const typed = outrosColab.split(/\s*[,/;-]\s*/).filter(Boolean);
                 setOutrosColab(typed.join(' / '));
              }}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-2"
            />
          </div>
        </div>

        {currentIdade > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 min-w-0">
            <h3 className="text-sm font-bold text-slate-500 mb-4">Acompanhamento de Consumo (Interativo)</h3>
            <div className="h-64 bg-slate-50 border border-slate-200 rounded-lg p-2 md:p-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthCurve.slice(0, Math.min(growthCurve.length, currentIdade + 10))} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dia" label={{ value: 'Idade (Dias)', position: 'insideBottom', offset: -10 }} stroke="#64748b" fontSize={12} />
                  <YAxis label={{ value: 'Consumo (kg)', angle: -90, position: 'insideLeft' }} stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="consumoAcumulado" stroke="#3b82f6" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 4 }} name="Esperado" />
                  {formData.consumoAcumuladoReal !== undefined && String(formData.consumoAcumuladoReal) !== '' && (
                    <ReferenceDot 
                      x={currentIdade} 
                      y={Number(formData.consumoAcumuladoReal)} 
                      r={6} 
                      fill={Number(formData.consumoAcumuladoReal) >= (expectedConsumption || 0) ? "#22c55e" : "#ef4444"} 
                      stroke="white" 
                      strokeWidth={2}
                       
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-slate-500 mt-2">
                O ponto colorido mostra o consumo real atual vs a curva esperada.
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 ml-2 mr-1 align-middle"></span> Acima/Na meta
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-2 mr-1 align-middle"></span> Abaixo
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 rounded text-sm transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-slate-900 text-white hover:bg-slate-800 font-semibold py-2.5 rounded text-sm transition-colors flex items-center justify-center gap-2"
          >
            {saving ? 'Registrando...' : (initialData ? 'Atualizar Lançamento' : 'Registrar Coleta')}
          </button>
        </div>
      </form>
    </div>
  );
}
