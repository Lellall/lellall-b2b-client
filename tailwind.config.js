module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#05431E",
        accent: "#0E5D37",
        secondary: "#FFFFFF",
        "accent-foreground": "#fff",
        "primary-foreground": "#FFFFFF",
        "secondary-foreground": "#000",
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
      },
    },
  },
}
