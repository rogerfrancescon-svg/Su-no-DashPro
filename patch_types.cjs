const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
if (!code.includes('cargaAlojamento')) {
  code = code.replace('metaAlojamento?: number;', 'cargaAlojamento?: number;\n  metaAlojamento?: number;');
  code = code.replace('metaCrescimento1?: number;', 'cargaCrescimento1?: number;\n  metaCrescimento1?: number;');
  code = code.replace('metaCrescimento2?: number;', 'cargaCrescimento2?: number;\n  metaCrescimento2?: number;');
  code = code.replace('metaCrescimento3?: number;', 'cargaCrescimento3?: number;\n  metaCrescimento3?: number;');
  code = code.replace('metaTerminacao1?: number;', 'cargaTerminacao1?: number;\n  metaTerminacao1?: number;');
  code = code.replace('metaTerminacao2?: number;', 'cargaTerminacao2?: number;\n  metaTerminacao2?: number;');
  fs.writeFileSync('src/types.ts', code);
}
