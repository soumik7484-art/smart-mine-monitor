import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SmartMine ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-mine-surface border border-mine-border rounded-md shadow-card space-y-4">
          <div className="flex items-center gap-2 text-status-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h2 className="text-base font-semibold text-mine-text-primary">View Temporarily Unavailable</h2>
          </div>
          <p className="text-xs text-mine-text-secondary">
            An issue occurred while rendering this module. You can navigate back to other views using the sidebar.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 text-xs font-semibold bg-mine-surface-alt hover:bg-mine-bg border border-mine-border rounded text-mine-text-primary transition-colors"
          >
            Retry View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
