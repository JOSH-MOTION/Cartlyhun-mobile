/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#fa8929", // Brand Orange (Yellow)
        secondary: "#442efb", // Brand Indigo
        background: "#ffffff", // Light Background
        surface: "#f8fafc", // Light Surface for cards
        "primary-fg": "#ffffff", // Text on primary
        accent: "#fa8929",
        muted: "#64748b",
        green: {
          500: '#fa8929',
        },
        emerald: {
          500: '#fa8929',
        },
        orange: {
          500: '#fa8929',
        },
        indigo: {
          500: '#442efb',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
