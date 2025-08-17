import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class TranslationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a browser translation related error
    const isTranslationError = 
      error.message?.includes('removeChild') ||
      error.message?.includes('The node to be removed is not a child') ||
      error.message?.includes('runtime-error-plugin') ||
      error.stack?.includes('runtime-error-plugin');

    if (isTranslationError) {
      console.warn('Browser translation conflict detected:', error.message);
      // Don't show error UI for translation conflicts, just log them
      return { hasError: false };
    }

    // For other errors, show the error boundary
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isTranslationError = 
      error.message?.includes('removeChild') ||
      error.message?.includes('The node to be removed is not a child') ||
      error.message?.includes('runtime-error-plugin') ||
      error.stack?.includes('runtime-error-plugin');

    if (isTranslationError) {
      console.warn('Translation-related error caught and suppressed:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
      
      // Try to recover by forcing a re-render
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
      
      return;
    }

    // Log non-translation errors normally
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ 
      hasError: true, 
      error, 
      errorInfo 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              حدث خطأ غير متوقع
            </h2>
            <p className="text-gray-600 mb-4">
              نعتذر، حدث خطأ في التطبيق. يرجى إعادة تحميل الصفحة.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              إعادة تحميل الصفحة
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TranslationErrorBoundary;