const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');
code = code.replace(/error\.message\?\.includes\('Failed to fetch'\)/g, "(error.message?.includes('fetch') || String(error).includes('fetch'))");
code = code.replace(/err\.message\?\.includes\('Failed to fetch'\)/g, "(err.message?.includes('fetch') || String(err).includes('fetch'))");
fs.writeFileSync('src/components/Login.tsx', code);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/error\.message\?\.includes\('Failed to fetch'\)/g, "(error.message?.includes('fetch') || String(error).includes('fetch'))");
appCode = appCode.replace(/err\.message\?\.includes\('Failed to fetch'\)/g, "(err?.message?.includes('fetch') || String(err).includes('fetch'))");
appCode = appCode.replace(/err\?\.message\?\.includes\('Failed to fetch'\)/g, "(err?.message?.includes('fetch') || String(err).includes('fetch'))");
fs.writeFileSync('src/App.tsx', appCode);
