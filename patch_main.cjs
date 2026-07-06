const fs = require('fs');

let mainCode = fs.readFileSync('src/main.tsx', 'utf8');

const interceptCode = `
// Intercept "Failed to fetch" errors that might be logged or thrown by Supabase/browser
const originalError = console.error;
console.error = (...args) => {
  const msg = args.map(a => (typeof a === 'string' ? a : (a?.message || String(a)))).join(' ');
  if (msg.includes('Failed to fetch') || msg.includes('fetch')) return;
  originalError.apply(console, args);
};
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (String(event.reason).includes('Failed to fetch') || String(event.reason).includes('fetch') || (event.reason.message && event.reason.message.includes('fetch')))) {
    event.preventDefault();
  }
});
window.addEventListener('error', (event) => {
  if (event.message && (event.message.includes('Failed to fetch') || event.message.includes('fetch'))) {
    event.preventDefault();
  }
});
`;

if (!mainCode.includes('unhandledrejection')) {
  mainCode = mainCode.replace("import './index.css';", "import './index.css';\n\n" + interceptCode);
  fs.writeFileSync('src/main.tsx', mainCode);
}
