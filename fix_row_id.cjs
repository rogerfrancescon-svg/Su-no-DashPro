const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace("getCol(row, 'id') = v.id;", "row.id = v.id;");

fs.writeFileSync('src/lib/storage.ts', code);
console.log("Fixed row.id");
