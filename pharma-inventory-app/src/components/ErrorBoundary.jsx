// src/components/ErrorBoundary.jsx
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('React ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0A0F0F',
          color: '#F0FAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'monospace',
        }}>
          <div style={{ maxWidth: '700px', width: '100%' }}>
            <h1 style={{ color: '#FB7185', fontSize: '1.5rem', marginBottom: '1rem' }}>
              ⚠ Erreur de rendu
            </h1>
            <p style={{ color: '#FCD34D', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {this.state.error.toString()}
            </p>
            <pre style={{
              background: '#111919',
              border: '1px solid #1F3535',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              overflow: 'auto',
              color: '#3D6B6B',
              whiteSpace: 'pre-wrap',
            }}>
              {this.state.info?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                background: '#2DD4BF',
                color: '#0A0F0F',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
