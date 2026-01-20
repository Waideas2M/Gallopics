import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: '#FEF2F2',
                    borderRadius: '8px',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    margin: '20px'
                }}>
                    <AlertTriangle size={48} style={{ marginBottom: '16px', margin: '0 auto', display: 'block' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Something went wrong</h2>
                    <p style={{ marginBottom: '16px' }}>We encountered an error while rendering this view.</p>
                    {this.state.error && (
                        <pre style={{
                            textAlign: 'left',
                            background: 'rgba(255,255,255,0.5)',
                            padding: '12px',
                            fontSize: '0.8rem',
                            overflow: 'auto',
                            marginBottom: '16px',
                            borderRadius: '4px'
                        }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 16px',
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
