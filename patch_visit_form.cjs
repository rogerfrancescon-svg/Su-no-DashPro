const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

// 1. Update the initial state logic in handle change for 'integradoNome'
code = code.replace(
  "if (lastVisit.mortalidade) updates.mortalidade = lastVisit.mortalidade;",
  "if (lastVisit.mortalidade) updates.mortalidade = lastVisit.mortalidade;\n          ['cargaAlojamento', 'consumoAlojamento', 'cargaCrescimento1', 'consumoCrescimento1', 'cargaCrescimento2', 'consumoCrescimento2', 'cargaCrescimento3', 'consumoCrescimento3', 'cargaTerminacao1', 'consumoTerminacao1', 'cargaTerminacao2', 'consumoTerminacao2', 'volumeTotalCargas', 'consumoAcumuladoReal'].forEach(key => {\n            if (lastVisit[key as keyof typeof lastVisit] !== undefined) updates[key] = lastVisit[key as keyof typeof lastVisit];\n          });"
);

// 2. Update the auto-calculation logic to calculate consumos when cargas change
const calcLogic = `
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
`;

code = code.replace(
  /if \(name === 'volumeTotalCargas' \|\| name === 'animaisAlojados'[\s\S]*?if \(\(name === 'date'/m,
  calcLogic + "\n      if ((name === 'date'"
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
