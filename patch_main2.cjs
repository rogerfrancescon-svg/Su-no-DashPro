const fs = require('fs');

let mainCode = fs.readFileSync('src/main.tsx', 'utf8');

const interceptCode2 = `
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args.map(a => (typeof a === 'string' ? a : (a?.message || String(a)))).join(' ');
  if (msg.includes('Failed to fetch') || msg.includes('fetch')) return;
  originalWarn.apply(console, args);
};
`;

if (!mainCode.includes('console.warn =')) {
  mainCode = mainCode.replace("const originalError", interceptCode2 + "\nconst originalError");
  fs.writeFileSync('src/main.tsx', mainCode);
}
