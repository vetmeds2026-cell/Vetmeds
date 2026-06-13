/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        'animation': {
            'text':'text 1s ease infinite',
        },
        'keyframes': {
            'text': {
                '0%, 100%': {
                   'background-size':'200% 200%',
                    'background-position': 'left center'
                },
                '50%': {
                   'background-size':'200% 200%',
                    'background-position': 'right center'
                }
            },
        },
        fontFamily: {
          sans: ['var(--font-jost)', 'sans-serif'],
        },
        colors: {
          primary: {
            DEFAULT: '#1D4ED8', // Main primary color (blue-700)
            light: '#3B82F6',   // Optional light variant (blue-500)
            dark: '#1E40AF',    // Optional dark variant (blue-800)
          },
        },
      },
    },
    plugins: [],
  }
  
  