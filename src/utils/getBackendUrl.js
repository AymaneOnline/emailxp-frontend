// Safe helper to read Vite backend URL without throwing when import.meta.env is undefined
export function getBackendUrl() {
  // Priority: runtime override `window.__BACKEND_URL__` -> Vite `import.meta.env.VITE_BACKEND_URL`
  // -> CRA `process.env.REACT_APP_BACKEND_URL` -> empty string.
  try {
    // 1) Runtime override (useful when serving a static build but want to inject at runtime)
    if (typeof window !== 'undefined' && window.__BACKEND_URL__) {
      const raw = String(window.__BACKEND_URL__).trim();
      const val = sanitize(raw);
      if (val) {
        console.info('getBackendUrl: using runtime override from window.__BACKEND_URL__');
        return val;
      }
    }

    // 2) Vite build-time env (access import.meta directly; wrapped by try/catch)
    // eslint-disable-next-line no-undef
    if (import.meta && import.meta.env && import.meta.env.VITE_BACKEND_URL) {
      const raw = String(import.meta.env.VITE_BACKEND_URL).trim();
      const val = sanitize(raw);
      if (val) {
        console.info('getBackendUrl: using VITE_BACKEND_URL (build-time)');
        return val;
      }
    }

    // 3) Create React App env (fall back)
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) {
      const raw = String(process.env.REACT_APP_BACKEND_URL).trim();
      const val = sanitize(raw);
      if (val) {
        console.info('getBackendUrl: using REACT_APP_BACKEND_URL (build-time)');
        return val;
      }
    }

    console.warn('getBackendUrl: VITE_BACKEND_URL is empty');
    return '';
  } catch (e) {
    return '';
  }
}

function sanitize(val) {
  if (!val || typeof val !== 'string') return '';
  let v = val.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  // If the value looks like HTML, treat as empty
  if (v.toLowerCase().startsWith('<!doctype') || v.toLowerCase().startsWith('<html')) {
    return '';
  }
  return v;
}
