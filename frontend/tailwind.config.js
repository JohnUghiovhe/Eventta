export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#faf7f2',
          100: '#f5f3f0',
          light: '#faf7f2',
        },
        navDark: '#2d3748',
      },
    },
  },
  plugins: [],
};