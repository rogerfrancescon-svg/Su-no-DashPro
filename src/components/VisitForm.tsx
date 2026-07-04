import React, { useState } from 'react';
import { Visit, Integrado } from '../types';
import { growthCurve, getExpectedConsumption } from '../data';
import { Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface VisitaFormProps {
  integrados: Integrado[];
  initialData?: Visit;
  onSave: (visit: Visit, integradoNome?: string, alojamentoDate?: string) => void;
  onCancel?: () => void;
}

export function VisitaForm({ integrados, initialData, onSave, onCancel }: VisitaFormProps) {
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
      }
    }
    
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      if ((name === 'date' || name === 'alojamentoDate' || name === 'integradoNome') && newData.date && newData.alojamentoDate) {
         const [vY, vM, vD] = newData.date.split('-');
         const [aY, aM, aD] = newData.alojamentoDate.split('-');
         const visitDate = new Date(Number(vY), Number(vM) - 1, Number(vD));
         const alojamentoDate = new Date(Number(aY), Number(aM) - 1, Number(aD));
         
         const diffTime = visitDate.getTime() - alojamentoDate.getTime();
         const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
         newData.idade = diffDays >= 0 ? diffDays : 0;
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
            <label className="block text-xs font-semibold text-slate-500 mb-1">Consumo Acumulado (kg)</label>
            <input 
              type="number" 
              step="0.01"
              name="consumoAcumuladoReal"
              value={formData.consumoAcumuladoReal ?? ''}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {expectedConsumption !== null && (
               <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                 <Info className="w-3 h-3"/> Esperado: ~{expectedConsumption}kg
               </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Animais Alojados</label>
            <input 
              type="number" 
              name="animaisAlojados"
              value={formData.animaisAlojados || ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFormData(prev => {
                  const mortos = Number(prev.animaisMortos) || 0;
                  const mortalidade = val > 0 ? Number(((mortos / val) * 100).toFixed(2)) : undefined;
                  return { ...prev, animaisAlojados: val || undefined, mortalidade };
                });
              }}
              placeholder="Ex: 1000"
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex justify-between items-center">
              <span>Animais Mortos</span>
              {formData.mortalidade !== undefined && formData.mortalidade !== null && !isNaN(Number(formData.mortalidade)) && (
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">{formData.mortalidade}%</span>
              )}
            </label>
            <input 
              type="number" 
              name="animaisMortos"
              value={formData.animaisMortos ?? ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFormData(prev => {
                  const aloj = Number(prev.animaisAlojados) || 0;
                  const mortalidade = aloj > 0 ? Number(((val / aloj) * 100).toFixed(2)) : undefined;
                  return { ...prev, animaisMortos: e.target.value === '' ? undefined : val, mortalidade };
                });
              }}
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

          <h3 className="text-sm font-bold text-slate-700">Consumos e Metas (kg/cab)</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Meta Aloj</label>
              <input type="number" step="0.01" name="metaAlojamento" value={formData.metaAlojamento || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Cons. Aloj</label>
              <input type="number" step="0.01" name="consumoAlojamento" value={formData.consumoAlojamento || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Meta Cresc 1</label>
              <input type="number" step="0.01" name="metaCrescimento1" value={formData.metaCrescimento1 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Cons. Cresc 1</label>
              <input type="number" step="0.01" name="consumoCrescimento1" value={formData.consumoCrescimento1 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Meta Cresc 2</label>
              <input type="number" step="0.01" name="metaCrescimento2" value={formData.metaCrescimento2 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Cons. Cresc 2</label>
              <input type="number" step="0.01" name="consumoCrescimento2" value={formData.consumoCrescimento2 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Meta Cresc 3</label>
              <input type="number" step="0.01" name="metaCrescimento3" value={formData.metaCrescimento3 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Cons. Cresc 3</label>
              <input type="number" step="0.01" name="consumoCrescimento3" value={formData.consumoCrescimento3 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Meta Term 1</label>
              <input type="number" step="0.01" name="metaTerminacao1" value={formData.metaTerminacao1 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Cons. Term 1</label>
              <input type="number" step="0.01" name="consumoTerminacao1" value={formData.consumoTerminacao1 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Meta Term 2</label>
              <input type="number" step="0.01" name="metaTerminacao2" value={formData.metaTerminacao2 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Cons. Term 2</label>
              <input type="number" step="0.01" name="consumoTerminacao2" value={formData.consumoTerminacao2 || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Meta Acumulada</label>
              <input type="number" step="0.01" name="metaAcumulada" value={formData.metaAcumulada || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Cons. Acum Real</label>
              <input type="number" step="0.01" name="consumoAcumuladoReal" value={formData.consumoAcumuladoReal || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
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
                  {formData.consumoAcumuladoReal !== undefined && formData.consumoAcumuladoReal !== '' && (
                    <ReferenceDot 
                      x={currentIdade} 
                      y={Number(formData.consumoAcumuladoReal)} 
                      r={6} 
                      fill={Number(formData.consumoAcumuladoReal) >= (expectedConsumption || 0) ? "#22c55e" : "#ef4444"} 
                      stroke="white" 
                      strokeWidth={2}
                      isFront 
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
