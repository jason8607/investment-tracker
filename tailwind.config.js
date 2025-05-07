/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3366cc',
        secondary: '#6699ff',
        success: '#4CAF50',
        danger: '#F44336',
        warning: '#FFC107',
        info: '#2196F3',
      },
    },
  },
  plugins: [],
};
