const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/!\(err\?\.message\?\.includes\('fetch'\) \|\| String\(err\)\.includes\('fetch'\)\)/g, "!(err?.message?.includes('fetch') || err?.message?.includes('Failed') || err?.code === '0' || String(err).includes('fetch') || String(err).includes('Failed'))");
appCode = appCode.replace(/error\.message\?\.includes\('fetch'\) \|\| String\(error\)\.includes\('fetch'\)/g, "error?.message?.includes('fetch') || error?.message?.includes('Failed') || error?.code === '0' || String(error).includes('fetch') || String(error).includes('Failed')");
fs.writeFileSync('src/App.tsx', appCode);

let loginCode = fs.readFileSync('src/components/Login.tsx', 'utf8');
loginCode = loginCode.replace(/err\.message\?\.includes\('fetch'\) \|\| String\(err\)\.includes\('fetch'\)/g, "err?.message?.includes('fetch') || err?.message?.includes('Failed') || err?.code === '0' || String(err).includes('fetch') || String(err).includes('Failed')");
loginCode = loginCode.replace(/error\.message\?\.includes\('fetch'\) \|\| String\(error\)\.includes\('fetch'\)/g, "error?.message?.includes('fetch') || error?.message?.includes('Failed') || error?.code === '0' || String(error).includes('fetch') || String(error).includes('Failed')");
fs.writeFileSync('src/components/Login.tsx', loginCode);
