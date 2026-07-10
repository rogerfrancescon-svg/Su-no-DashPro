import React, { useMemo, useState } from 'react';
import { growthCurve, growthCurveFemea, defaultMetas, defaultMetasFemea } from '../data';

export function ReferenceCurve() {
  const [tipoLote, setTipoLote] = useState<'Misto' | 'Fêmea'>('Misto');

  const activeCurve = tipoLote === 'Fêmea' ? growthCurveFemea : growthCurve;
  const activeMetas = tipoLote === 'Fêmea' ? defaultMetasFemea : defaultMetas;

  const fullCurve = useMemo(() => {
    const sorted = [...activeCurve].sort((a, b) => a.dia - b.dia);
    const full = [];
    const maxDia = sorted[sorted.length - 1].dia;
    
    for (let dia = 1; dia <= maxDia; dia++) {
      const exactMatch = sorted.find(p => p.dia === dia);
      if (exactMatch) {
        full.push(exactMatch);
        continue;
      }
      
      for (let i = 0; i < sorted.length - 1; i++) {
        if (dia > sorted[i].dia && dia < sorted[i+1].dia) {
          const p1 = sorted[i];
          const p2 = sorted[i+1];
          const ratio = (dia - p1.dia) / (p2.dia - p1.dia);
          
          full.push({
            dia,
            pesoInicial: p1.pesoInicial + ratio * (p2.pesoInicial - p1.pesoInicial),
            pesoFinal: p1.pesoFinal + ratio * (p2.pesoFinal - p1.pesoFinal),
            cmd: p1.cmd + ratio * (p2.cmd - p1.cmd),
            consumoAcumulado: p1.consumoAcumulado + ratio * (p2.consumoAcumulado - p1.consumoAcumulado),
            gpd: p1.gpd + ratio * (p2.gpd - p1.gpd)
          });
          break;
        }
      }
    }
    return full;
  }, [activeCurve]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-sm font-bold text-slate-500 uppercase">Tabela de Referência:</span>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setTipoLote('Misto')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${tipoLote === 'Misto' ? 'bg-white shadow text-[#2D452B]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Lotes Mistos
          </button>
          <button 
            onClick={() => setTipoLote('Fêmea')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${tipoLote === 'Fêmea' ? 'bg-white shadow text-[#2D452B]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Lotes Fêmeas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider p-6 bg-white border-b border-slate-200">
          Programas Alimentares (Fases) - {tipoLote}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm text-slate-600 min-w-[600px]">
            <thead className="bg-[#2D452B] text-white font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">FASE</th>
                <th className="px-4 py-3">Aloj</th>
                <th className="px-4 py-3">C1</th>
                <th className="px-4 py-3">C2</th>
                <th className="px-4 py-3">C3</th>
                <th className="px-4 py-3">T1</th>
                <th className="px-4 py-3">T2</th>
                <th className="px-4 py-3 bg-[#1A3A5B]">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-left font-bold bg-[#2D452B] text-white whitespace-nowrap">Dias de Consumo</td>
                <td className="px-4 py-3">14</td>
                <td className="px-4 py-3">{tipoLote === 'Fêmea' ? '14' : '18'}</td>
                <td className="px-4 py-3">14</td>
                <td className="px-4 py-3">{tipoLote === 'Fêmea' ? '14' : '18'}</td>
                <td className="px-4 py-3">10</td>
                <td className="px-4 py-3">{tipoLote === 'Fêmea' ? '14' : '22'}</td>
                <td className="px-4 py-3 font-bold bg-[#1A3A5B] text-white">{tipoLote === 'Fêmea' ? '80' : '96'}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-left font-bold bg-[#2D452B] text-white whitespace-nowrap">Qtdade ração/ fase</td>
                <td className="px-4 py-3">{activeMetas.metaAlojamento.toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">{activeMetas.metaCrescimento1.toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">{activeMetas.metaCrescimento2.toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">{activeMetas.metaCrescimento3.toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">{activeMetas.metaTerminacao1.toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">{activeMetas.metaTerminacao2.toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3 font-bold bg-[#1A3A5B] text-white">{activeMetas.metaAcumulada.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-left font-bold bg-[#2D452B] text-white whitespace-nowrap">CMD</td>
                <td className="px-4 py-3">{(activeMetas.metaAlojamento / 14).toFixed(3).replace('.', ',')}</td>
                <td className="px-4 py-3">{(activeMetas.metaCrescimento1 / (tipoLote === 'Fêmea' ? 14 : 18)).toFixed(3).replace('.', ',')}</td>
                <td className="px-4 py-3">{(activeMetas.metaCrescimento2 / 14).toFixed(3).replace('.', ',')}</td>
                <td className="px-4 py-3">{(activeMetas.metaCrescimento3 / (tipoLote === 'Fêmea' ? 14 : 18)).toFixed(3).replace('.', ',')}</td>
                <td className="px-4 py-3">{(activeMetas.metaTerminacao1 / 10).toFixed(3).replace('.', ',')}</td>
                <td className="px-4 py-3">{(activeMetas.metaTerminacao2 / (tipoLote === 'Fêmea' ? 14 : 22)).toFixed(3).replace('.', ',')}</td>
                <td className="px-4 py-3 font-bold bg-[#1A3A5B] text-white">{(activeMetas.metaAcumulada / (tipoLote === 'Fêmea' ? 80 : 96)).toFixed(3).replace('.', ',')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm text-slate-600 min-w-[600px]">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Dia</th>
                <th className="px-4 py-3">Peso Inicial (kg)</th>
                <th className="px-4 py-3">Peso Final (kg)</th>
                <th className="px-4 py-3">Consumo Diário (CMD)</th>
                <th className="px-4 py-3">Consumo Acumulado (kg)</th>
                <th className="px-4 py-3">Ganho Diário (GPD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fullCurve.map((row) => (
                <tr key={row.dia} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.dia}</td>
                  <td className="px-4 py-3">{row.pesoInicial.toFixed(2)}</td>
                  <td className="px-4 py-3">{row.pesoFinal.toFixed(2)}</td>
                  <td className="px-4 py-3">{row.cmd.toFixed(3)}</td>
                  <td className="px-4 py-3 font-medium text-blue-600">{row.consumoAcumulado.toFixed(2)}</td>
                  <td className="px-4 py-3">{row.gpd.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
