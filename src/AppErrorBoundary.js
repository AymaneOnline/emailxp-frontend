import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can log error to an error reporting service here
    // console.error(error, errorInfo);
  }
  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong.</h1>
          <p className="text-lg text-gray-700 mb-6">An unexpected error occurred. Please try again or contact support if the problem persists.</p>
          <button onClick={this.handleRetry} className="px-6 py-2 bg-primary-red text-white rounded-md shadow-md hover:bg-custom-red-hover transition-colors duration-200 text-base font-medium">Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;

