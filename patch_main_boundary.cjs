const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

code = code.replace(
  'return { hasError: true, error };',
  "if (error && (String(error).includes('fetch') || (error.message && error.message.includes('fetch')))) return { hasError: false, error: null };\n    return { hasError: true, error };"
);

fs.writeFileSync('src/main.tsx', code);
