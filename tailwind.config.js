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
        'custom-red-hover': '#d32f2f', // Hover state for primary red
        'light-cream': '#FDF6F0', // Updated to match design - light beige/cream
        'dark-gray': '#333',     // Dark text color for headings etc.
        'gray-600': '#4B5563',   // A slightly lighter gray for body text, already a default Tailwind color, but good to note
        'gray-500': '#6B7280',   // For darker gray text/icons
        'gray-400': '#9CA3AF',   // For lighter gray text/icons
        'lighter-red': '#f8d7da', // Used for hover state on bordered red buttons
        'brand-red': '#d32a2a', // Specific red from login/register logo (EmailXP)
        'brand-red-hover': '#b71c1c', // Hover for brand-red buttons
        'border-gray-200': '#e5e7eb', // Standard border color
        'bg-gray-100': '#F3F4F6', // Lighter background than default gray
        'footer-dark': '#1F2937', // Dark footer background
        // Semantic aliases (use these going forward)
        'surface-base': '#FFFFFF',
        'surface-alt': '#F9FAFB',
        'surface-inset': '#F3F4F6',
        'surface-dark': '#1F2937',
        'border-subtle': '#E5E7EB',
        'border-strong': '#D1D5DB',
        'text-primary': '#111827',
        'text-secondary': '#4B5563',
        'text-tertiary': '#6B7280',
        'accent': '#E74C3C',
        'accent-hover': '#d32f2f',
        'success': '#059669',
        'warning': '#D97706',
        'danger': '#DC2626',
        'info': '#2563EB',
        'muted': '#9CA3AF'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Set Inter as the default sans-serif font
        poppins: ['Poppins', 'sans-serif'], // Keep Poppins available for Login/Register if specific
      },
      spacing: {
        'rhythm-1': '0.25rem',
        'rhythm-2': '0.5rem',
        'rhythm-3': '0.75rem',
        'rhythm-4': '1rem',
        'rhythm-5': '1.25rem',
        'rhythm-6': '1.5rem',
        'rhythm-8': '2rem'
      },
      borderRadius: {
        'sm2': '3px',
        'md2': '7px'
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    styled: true,
    themes: [
      {
        emailxp: {
          'primary': '#E74C3C',
          'secondary': '#6B7280',
          'accent': '#E74C3C',
          'neutral': '#111827',
          'base-100': '#FFFFFF',
          'info': '#2563EB',
          'success': '#059669',
          'warning': '#D97706',
          'error': '#DC2626'
        }
      }
    ],
    base: true,
    utils: true,
    logs: false,
    rtl: false
  }
}