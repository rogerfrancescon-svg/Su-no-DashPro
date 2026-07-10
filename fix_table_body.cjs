const fs = require('fs');
let code = fs.readFileSync('src/components/Visits.tsx', 'utf8');

const targetBodyStart = code.indexOf('<tr key={v.id} className="hover:bg-slate-50 transition-colors">');
const targetBodyEnd = code.indexOf('<td className="px-5 py-4 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10">', targetBodyStart);

if (targetBodyStart === -1 || targetBodyEnd === -1) {
  console.error("Could not find table row boundaries.");
  process.exit(1);
}

const replacement = `<tr key={v.id} className="hover:bg-slate-50 transition-colors">
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
                            {v.recomendacao.split('\\n').filter(l => l.trim()).map((line, i) => (
                              <div key={i}>{line.replace(/^[-\\*]\\s*/, '').trim()}</div>
                            ))}
                          </div>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold">{v.consumoAcumuladoReal ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.comedouro || '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">{v.colaborador ? v.colaborador.replace(/\\s*,\\s*/g, ' / ') : '-'}</td>
                    
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
                    
                    `;

code = code.substring(0, targetBodyStart) + replacement + code.substring(targetBodyEnd);
fs.writeFileSync('src/components/Visits.tsx', code);
console.log("Visits.tsx patched!");
