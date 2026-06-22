/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // Brand Blue
        secondary: "#442efb", // Brand Indigo
        background: "#ffffff", // Light Background
        surface: "#f8fafc", // Light Surface for cards
        "primary-fg": "#ffffff", // Text on primary
        accent: "#2563eb",
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
