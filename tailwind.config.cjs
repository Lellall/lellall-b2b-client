/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#092d2b",
        accent: "#0E5D37",
      },
    },
  },
  plugins: [],
}
