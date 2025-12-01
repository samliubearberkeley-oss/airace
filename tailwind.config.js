/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nes: {
          black: '#f5f5f5',
          'dark-gray': '#e8e8e8',
          gray: '#d0d0d0',
          'light-gray': '#666666',
          white: '#ffffff',
          red: '#e91e63',
          pink: '#f06292',
          orange: '#ff9800',
          yellow: '#ffeb3b',
          green: '#4caf50',
          'light-green': '#8bc34a',
          cyan: '#00bcd4',
          blue: '#2196f3',
          indigo: '#3f51b5',
          purple: '#9c27b0',
          brown: '#795548',
        },
      },
      fontFamily: {
        pixel: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
