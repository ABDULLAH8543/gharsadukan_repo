/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,css,scss}',
    './components/**/*.{js,jsx,ts,tsx,css,scss}',
    './app/[shopSlug]/**/*.{js,jsx,ts,tsx,css,scss}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
