// Safe helper to resolve a backend URL.
// Resolution order (first non-empty wins):
// 1. runtime global `window.__BACKEND_URL__` (can be injected into index.html at deploy time)
// 2. localStorage key `backend_url` (useful for quick switches in the browser)
// 3. Vite build-time env `import.meta.env.VITE_BACKEND_URL`
// 4. Create-React-App env `process.env.REACT_APP_BACKEND_URL` (for older setups)
// 5. empty string (use relative paths)
export function getBackendUrl() {
  try {
    // 1) runtime global (injected script)
    // eslint-disable-next-line no-undef
    if (typeof window !== 'undefined') {
      // prefer explicit runtime global
      // eslint-disable-next-line no-undef
      if (window.__BACKEND_URL__ && typeof window.__BACKEND_URL__ === 'string') {
        return window.__BACKEND_URL__;
      }

      // support an optional runtime config object
      // eslint-disable-next-line no-undef
      if (window.__RUNTIME_CONFIG__ && window.__RUNTIME_CONFIG__.backendUrl) {
        return window.__RUNTIME_CONFIG__.backendUrl;
      }

      // 2) localStorage override (developer convenience)
      try {
        const stored = window.localStorage.getItem('backend_url');
        if (stored) return stored;
      } catch (e) {
        // ignore storage errors (e.g., sandboxed iframes)
      }
    }

    // 3) Vite build-time env
    // Access import.meta.env via a runtime Function so the static parser used by
    // Create-React-App (react-scripts) does not choke on the `import.meta` token.
    try {
      const viteVal = new Function('return (typeof import !== "undefined" && import.meta && import.meta.env && import.meta.env.VITE_BACKEND_URL) || ""')();
      if (viteVal) return viteVal;
    } catch (e) {
      // ignore
    }

    // 4) CRA fallback (process.env)
    // eslint-disable-next-line no-undef
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) {
      return process.env.REACT_APP_BACKEND_URL;
    }

    return '';
  } catch (e) {
    return '';
  }
}
