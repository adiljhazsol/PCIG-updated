import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          fontFamily: "'Inter', sans-serif",
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              backgroundColor: '#FEF2F2',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>
            
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              color: '#1E293B',
              marginBottom: '12px'
            }}>
              Something went wrong
            </h1>
            
            <p style={{ 
              color: '#64748B', 
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              The application encountered an unexpected error. We've logged this issue and are working to fix it.
            </p>

            {this.state.error && (
              <div style={{
                backgroundColor: '#F1F5F9',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'left',
                fontSize: '13px',
                color: '#EF4444',
                fontFamily: 'monospace',
                overflow: 'auto',
                maxHeight: '150px'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.2s'
              }}
            >
              <RefreshCcw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
