// emailxp/frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#E74C3C', // Main accent red
        'light-cream': '#FFF9F2', // Used for sections like features, pricing, FAQ
        'dark-gray': '#333',     // Dark text color for headings etc.
        'gray-600': '#4B5563',   // A slightly lighter gray for body text, already a default Tailwind color, but good to note
        'gray-500': '#6B7280',   // For darker gray text/icons
        'gray-400': '#9CA3AF',   // For lighter gray text/icons
        'lighter-red': '#f8d7da', // Used for hover state on bordered red buttons
        'brand-red': '#d32a2a', // Specific red from login/register logo (EmailXP)
        'brand-red-hover': '#b71c1c', // Hover for brand-red buttons
        'border-gray-200': '#e5e7eb', // Standard border color
        'bg-gray-100': '#F3F4F6', // Lighter background than default gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Set Inter as the default sans-serif font
        poppins: ['Poppins', 'sans-serif'], // Keep Poppins available for Login/Register if specific
      },
    },
  },
  plugins: [],
}