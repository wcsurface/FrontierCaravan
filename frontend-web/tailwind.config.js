/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wasteland: {
          900: '#0a0b0d',
          800: '#12151a',
          700: '#1a202c',
          600: '#2d3748',
          accent: '#ed8936',
          danger: '#e53e3e',
          success: '#38a169',
          tech: '#3182ce',
        },
      },
    },
  },
  plugins: [],
};
