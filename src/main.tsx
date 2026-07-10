import { registerSW } from 'virtual:pwa-register';
if ('serviceWorker' in navigator) { registerSW({ immediate: true }); }
// @ts-nocheck

window.onerror = function(msg, url, lineNo, columnNo, error) {
  if (!error) return false;
  if (typeof error === 'object' && Object.keys(error).length === 0 && !(error instanceof Error)) {
    return true;
  }
  if (String(msg).includes('fetch') || String(error).includes('fetch')) return true;
  return false;
};
window.onunhandledrejection = function(event) {
  if (!event.reason) return false;
  if (typeof event.reason === 'object' && Object.keys(event.reason).length === 0 && !(event.reason instanceof Error)) {
    event.preventDefault();
  }
  if (String(event.reason).includes('fetch') || (event.reason.message && event.reason.message.includes('fetch'))) {
    event.preventDefault();
  }
};
const originalAddEventListener = window.addEventListener;
window.addEventListener = function(type: any, listener: any, options?: any) {
  if (type === 'error' || type === 'unhandledrejection') {
    const wrappedListener = function(this: any, event: any) {
      let err = event.error || event.reason;
      if (err && typeof err === 'object' && Object.keys(err).length === 0 && !(err instanceof Error)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      return typeof listener === 'function' ? listener.apply(this, arguments) : listener.handleEvent(event);
    };
    return originalAddEventListener.call(window, type, wrappedListener, options);
  }
  return originalAddEventListener.call(window, type, listener, options);
};

import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';

import App from './App.tsx';
import './index.css';


// Intercept "Failed to fetch" errors that might be logged or thrown by Supabase/browser


const originalWarn = console.warn;
console.warn = (...args) => {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && Object.keys(args[0]).length === 0 && !(args[0] instanceof Error)) return;
  const msg = args.map(a => {
    if (a instanceof Error) return a.stack || a.message || String(a);
    if (typeof a === 'object') {
      try { return JSON.stringify(a, Object.getOwnPropertyNames(a)); } catch(e) { return String(a); }
    }
    return String(a);
  }).join(' ');
  if (msg.includes('Failed to fetch') || msg.includes('fetch')) return;
  originalWarn.apply(console, args);
};




const originalError = console.error;
console.error = (...args) => {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && Object.keys(args[0]).length === 0 && !(args[0] instanceof Error)) return;
  const msg = args.map(a => {
    if (a instanceof Error) return a.stack || a.message || String(a);
    if (typeof a === 'object') {
      try { return JSON.stringify(a, Object.getOwnPropertyNames(a)); } catch(e) { return String(a); }
    }
    return String(a);
  }).join(' ');
  if (msg.includes('Failed to fetch') || msg.includes('fetch')) return;
  originalError.apply(console, args);
};


window.addEventListener('unhandledrejection', e => e.preventDefault());
window.addEventListener('error', e => e.preventDefault());


class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    if (!error) return { hasError: false, error: null };
    if (typeof error === 'object' && Object.keys(error).length === 0 && !(error instanceof Error)) return { hasError: false, error: null };
    if (String(error).includes('fetch') || (error.message && error.message.includes('fetch'))) return { hasError: false, error: null };
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h2>Algo deu errado.</h2>
          <details style={{ whiteSpace: 'pre-wrap', color: 'red' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}
          >
            Limpar Dados e Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
