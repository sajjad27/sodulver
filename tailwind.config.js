/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // "primary":"#255ED6",
        'primary': "#255ED6",
        'focused-primary': "#1b47a6",
        'secondary': "#262433",
        'background': "#F2F5F9",
        'pr-font': "#262433",
        'secondary-font': "#71707A",
        'default-ring': "#3B82F680"
      },
      screens: {
        'xs': { 'min': '0px', 'max': '767px' },
        // => @media (min-width: 640px and max-width: 767px) { ... }

        'sm': { 'min': '768px', 'max': '1023px' },
        // => @media (min-width: 768px and max-width: 1023px) { ... }

        'md': { 'min': '1024px', 'max': '1279px' },
        // => @media (min-width: 1024px and max-width: 1279px) { ... }

        'lg': { 'min': '1280px', 'max': '1535px' },
        // => @media (min-width: 1280px and max-width: 1535px) { ... }

        'xlg': { 'min': '1536px' },
        // => @media (min-width: 1536px) { ... }
      },
      fontFamily: {
        poppins: ['Poppins'],
        ubuntu: ['Ubuntu']
      },
      width: {
        '26': '7.5rem',
      }
    },
  },
  plugins: [],
}