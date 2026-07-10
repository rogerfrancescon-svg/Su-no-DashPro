const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const target1 = `      for (const row of allData) {
        const integradoNome = row['Integrado'];`;

const replacement1 = `      if (allData.length > 0) {
        console.log('--- SUPABASE FIRST ROW DATA ---', allData[0]);
        console.log('--- SUPABASE FIRST ROW KEYS ---', Object.keys(allData[0]));
      }

      const getCol = (row: any, colName: string) => {
        if (row[colName] !== undefined) return row[colName];
        const lowerColName = colName.toLowerCase();
        for (const key of Object.keys(row)) {
          if (key.toLowerCase() === lowerColName) return row[key];
        }
        return undefined;
      };

      for (const row of allData) {
        const integradoNome = getCol(row, 'Integrado');`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
} else {
  console.log("target1 not found");
}

code = code.replace(/row\['Alojamento'\]/g, "getCol(row, 'Alojamento')")
           .replace(/row\['Data'\]/g, "getCol(row, 'Data')")
           .replace(/row\.id/g, "getCol(row, 'id')")
           .replace(/row\['Idade'\]/g, "getCol(row, 'Idade')")
           .replace(/row\['Animais Alojados'\]/g, "getCol(row, 'Animais Alojados')")
           .replace(/row\['Animais Mortos'\]/g, "getCol(row, 'Animais Mortos')")
           .replace(/row\['Vol\. Cargas \(kg\)'\]/g, "getCol(row, 'Vol. Cargas (kg)')")
           .replace(/row\['Recomendação'\]/g, "getCol(row, 'Recomendação')")
           .replace(/row\['Consumo Acumulado Real'\]/g, "getCol(row, 'Consumo Acumulado Real')")
           .replace(/row\['Consumo acumulado'\]/g, "getCol(row, 'Consumo acumulado')")
           .replace(/row\['Comedouro'\]/g, "getCol(row, 'Comedouro')")
           .replace(/row\['Colaborador'\]/g, "getCol(row, 'Colaborador')")
           .replace(/row\['Peso aloj'\]/g, "getCol(row, 'Peso aloj')")
           .replace(/row\['Pontuação Sanitária'\]/g, "getCol(row, 'Pontuação Sanitária')")
           .replace(/row\['Meta Aloj'\]/g, "getCol(row, 'Meta Aloj')")
           .replace(/row\['Cons\. Aloj'\]/g, "getCol(row, 'Cons. Aloj')")
           .replace(/row\['Meta Cresc 1'\]/g, "getCol(row, 'Meta Cresc 1')")
           .replace(/row\['Cons\. Cresc 1'\]/g, "getCol(row, 'Cons. Cresc 1')")
           .replace(/row\['Meta Cresc 2'\]/g, "getCol(row, 'Meta Cresc 2')")
           .replace(/row\['Cons\. Cresc 2'\]/g, "getCol(row, 'Cons. Cresc 2')")
           .replace(/row\['Meta Cresc 3'\]/g, "getCol(row, 'Meta Cresc 3')")
           .replace(/row\['Cons\. Cresc 3'\]/g, "getCol(row, 'Cons. Cresc 3')")
           .replace(/row\['Meta Term 1'\]/g, "getCol(row, 'Meta Term 1')")
           .replace(/row\['Cons\. Term 1'\]/g, "getCol(row, 'Cons. Term 1')")
           .replace(/row\['Meta Term 2'\]/g, "getCol(row, 'Meta Term 2')")
           .replace(/row\['Cons\. Term 2'\]/g, "getCol(row, 'Cons. Term 2')")
           .replace(/row\['Meta Acum\.'\]/g, "getCol(row, 'Meta Acum.')");

fs.writeFileSync('src/lib/storage.ts', code);
console.log("Patched storage keys!");
