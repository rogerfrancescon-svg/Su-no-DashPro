const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const mockFetch = `
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    return await originalFetch(...args);
  } catch (error) {
    if (String(error).includes('fetch') || (error.message && error.message.includes('fetch')) || error.name === 'TypeError') {
      console.log('Intercepted fetch error, returning mock response for:', args[0]);
      // Return a fake response that fails gracefully instead of throwing
      return new Response(JSON.stringify({ error: 'offline', message: 'Failed to fetch (mocked)' }), {
        status: 502,
        statusText: 'Bad Gateway',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
};
`;

code = code.replace("import App from './App.tsx';", mockFetch + "\nimport App from './App.tsx';");
fs.writeFileSync('src/main.tsx', code);
