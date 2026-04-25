import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
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
    const { hasError, error } = (this as any).state;
    const { children } = (this as any).props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-200">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Something went wrong</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                The application encountered an unexpected error and had to stop. This might be due to a memory limit or a generation failure.
              </p>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <p className="text-[10px] font-mono text-red-400 break-all text-left uppercase tracking-tighter">
                {error?.message || 'Unknown runtime error'}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors"
            >
              <RefreshCcw className="w-5 h-5" />
              Reload Application
            </button>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              MasterFace Identity Lock v2.5
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}
