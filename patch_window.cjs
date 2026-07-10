const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code += `\n\nif (typeof window !== 'undefined') {\n  (window as any).verifyDataConsistency = storage.verifyDataConsistency;\n}\n`;

fs.writeFileSync('src/lib/storage.ts', code);
