import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="w-12 h-12 mx-auto opacity-60">
              <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
            </div>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro. Por favor, recarrega a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
