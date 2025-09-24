// runtime-env.js
// This file sets runtime-level environment variables for the frontend.
// It is loaded before the main bundle so `getBackendUrl()` can read `window.__BACKEND_URL__`.
(function () {
  // Replace this value when deploying, or let your hosting inject it.
  window.__BACKEND_URL__ = "https://emailxp-backend-production.up.railway.app";
})();
