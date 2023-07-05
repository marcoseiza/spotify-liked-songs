/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      width: {
        90: "22rem",
      },
      colors: {
        skeleton: "#737373",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#1db954",
          secondary: "#1db990",
          accent: "#1db9ac",
          neutral: "#18342b",
          "base-100": "#191414",
          "base-200": "#120e0e",
          info: "#3abff8",
          success: "#26916a",
          warning: "#fbbd23",
          error: "#c44545",
        },
      },
    ],
  },
};
