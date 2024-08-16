const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    screens: {
      'xs': '360px',
      'sm': '640px',
      'md': '768px',
      'lg': '1280px',
      'xl': '1920px'
    },
    fontFamily: {
      'caviar': 'Caviar',
      'nunito': 'Nunito'
    },
    colors: {
      darkBg: '#1a1a1c',
      ...colors
    },

    extend: {},
  },
  plugins: []
}