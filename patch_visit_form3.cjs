const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const oldTableStart = '<h3 className="text-sm font-bold text-slate-700">Consumos e Metas (kg/cab)</h3>';
const oldTableEnd = '</div>\n        </div>\n\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">';

const newTable = `<h3 className="text-sm font-bold text-slate-700">Lançamento de Cargas e Consumo (kg)</h3>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">`;

const startIdx = code.indexOf(oldTableStart);
const endIdx = code.indexOf(oldTableEnd);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newTable + code.substring(endIdx + oldTableEnd.length);
  fs.writeFileSync('src/components/VisitForm.tsx', code);
  console.log('Patched');
} else {
  console.log("Could not find table boundaries", startIdx, endIdx);
}
