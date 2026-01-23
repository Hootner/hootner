/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-green': '#00ff00',
        'cyber-cyan': '#00ffff',
        'cyber-purple': '#ff00ff',
        'cyber-yellow': '#ffff00',
      },
      animation: {
        'pulse-custom': 'pulse 2s infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00' },
          '100%': { boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00' },
        },
      },
    },
  },
  plugins: [],
};
