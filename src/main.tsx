// @ts-nocheck
import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
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
