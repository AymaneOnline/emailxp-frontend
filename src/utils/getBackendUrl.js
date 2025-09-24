// Safe helper to read Vite backend URL without throwing when import.meta.env is undefined
export function getBackendUrl() {
  try {
    // Accessing import.meta may throw in non-module environments, so guard with try/catch
    // Use optional chaining where supported by the environment/bundler.
    // If Vite provides `import.meta.env.VITE_BACKEND_URL` it will be returned, otherwise empty string.
    // eslint-disable-next-line no-undef
    let val = (import.meta && import.meta.env && import.meta.env.VITE_BACKEND_URL) || '';
    if (typeof val === 'string') {
      val = val.trim();
      // Strip surrounding single or double quotes if present (some hosts include quotes)
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).trim();
      }
      // Basic sanity: if it looks like an HTML document, treat as empty
      if (val.startsWith('<!doctype') || val.startsWith('<html')) {
        console.warn('getBackendUrl: VITE_BACKEND_URL appears to be HTML; treating as empty.');
        return '';
      }
      if (!val) {
        console.warn('getBackendUrl: VITE_BACKEND_URL is empty');
      }
    }
    return val || '';
  } catch (e) {
    return '';
  }
}
