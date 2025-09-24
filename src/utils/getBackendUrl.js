// Safe helper to read Vite backend URL without throwing when import.meta.env is undefined
export function getBackendUrl() {
  try {
    // Accessing import.meta may throw in non-module environments, so guard with try/catch
    // Use optional chaining where supported by the environment/bundler.
    // If Vite provides `import.meta.env.VITE_BACKEND_URL` it will be returned, otherwise empty string.
    // eslint-disable-next-line no-undef
    return (import.meta && import.meta.env && import.meta.env.VITE_BACKEND_URL) || '';
  } catch (e) {
    return '';
  }
}
