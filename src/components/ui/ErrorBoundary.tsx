import { Component, type ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Auto-reload on chunk load failures (stale SW cache after deploy)
    const isChunkError =
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Loading CSS chunk');
    const key = 'readiLi.chunkReload';
    if (isChunkError && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      window.location.reload();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--background)] px-6 gap-5">
          <AlertCircle size={48} className="text-[var(--salmon)] opacity-70" />
          <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">
            Something went wrong
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)] text-center max-w-xs">
            An unexpected error occurred. Try again or refresh the page.
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-2 flex items-center gap-2 px-8 py-4 rounded-[20px] bg-[var(--lavender)] text-white text-[16px] font-semibold"
          >
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
