// PostCSS configuration for the project
// Use the Tailwind PostCSS plugin (v3-compatible). If you upgrade Tailwind, ensure
// the correct PostCSS plugin is installed and update this file accordingly.
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')
  ]
};
