// Lightweight dev-only logger. Use this instead of console.log directly for
// noisy debug statements so production consoles stay clean.
export default function devLog(...args) {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  } catch (e) {
    // ignore
  }
}
