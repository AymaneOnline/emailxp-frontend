import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { store } from './store/store'; // Import your Redux store
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { configureAxios } from './utils/axiosInterceptor'; // NEW: Import configureAxios
import AppErrorBoundary from './AppErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Silence noisy console output in non-development environments to keep
// production/preview consoles clean. Individual dev-only logs should use
// the `devLog` helper where verbose info is required.
try {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'development') {
    // eslint-disable-next-line no-console
    console.log = () => {};
    // eslint-disable-next-line no-console
    console.debug = () => {};
    // eslint-disable-next-line no-console
    console.info = () => {};
    // keep console.warn and console.error so errors are visible in prod
  }
} catch (e) {
  // ignore
}

// Configure Axios interceptors with the Redux store
configureAxios(store); // Call the function here

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
