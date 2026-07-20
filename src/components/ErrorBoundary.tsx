import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', padding: '2rem',
        textAlign: 'center', fontFamily: 'system-ui, sans-serif',
        background: '#0f1117', color: '#f8fafc',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Something went wrong
        </h2>
        <p style={{
          color: '#94a3b8', maxWidth: '520px', lineHeight: 1.6, marginBottom: '1.5rem',
          fontFamily: 'monospace', fontSize: '0.9rem',
          background: '#1e293b', padding: '1rem', borderRadius: '8px',
          wordBreak: 'break-word',
        }}>
          {this.state.error?.message ?? 'Unknown error'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#3b82f6', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '0.75rem 1.5rem',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Reload page
        </button>
      </div>
    );
  }
}
