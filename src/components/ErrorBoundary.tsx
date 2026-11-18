import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Terjadi kesalahan pada aplikasi.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      let parsedDetail: string | null = null;
      try {
        const obj = JSON.parse(this.state.message);
        if (obj && obj.error) {
          parsedDetail = `${obj.operationType?.toUpperCase() || 'OP'} pada ${obj.path || '-'}: ${obj.error}`;
        }
      } catch {
        parsedDetail = null;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-semibold">Gangguan Operasi Panel Admin</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Sistem mendeteksi kendala saat memproses data atau izin akses Firestore. Pastikan akun yang masuk telah terverifikasi dan memiliki otorisasi yang sesuai.
            </p>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/70 text-xs font-mono text-slate-700 dark:text-slate-300 break-words">
              {parsedDetail || this.state.message}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Muat Ulang Tampilan
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
