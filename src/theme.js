import { createContext, useState, useMemo, useEffect } from "react";
import { createTheme } from "@mui/material/styles";

// color design tokens
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        grey: {
            100: "#d1d2d3",  // Lightest grey
            200: "#a3a5a6",
            300: "#76777a",
            400: "#484a4d",
            500: "#1a1d21",
            600: "#15171a",
            700: "#101114",
            800: "#0a0c0d",
            900: "#050607"   // Darkest grey
        },
        primary: {
          100: "#d9cfd9",  // Lightest primary
          200: "#b29fb3",
          300: "#8c6e8c",
          400: "#653e66",
          500: "#3f0e40",
          600: "#320b33",
          700: "#260826",
          800: "#19061a",
          900: "#0d030d"   // Darkest primary
        },
        greenAccent: {
          100: "#dbf5ee",  // Lightest green accent
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922"   // Darkest green accent
        },
        redAccent: {
          100: "#f8dcdb",  // Lightest red accent
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f"   // Darkest red accent
        },
        blueAccent: {
          100: "#e1e2fe",  // Lightest blue accent
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#868dfb",
          500: "#6870fa",
          600: "#535ac8",
          700: "#3e4396",
          800: "#2a2d64",
          900: "#151632"   // Darkest blue accent
        },
      }
    : {
        grey: {
            100: "#050607",  // Darkest grey
            200: "#0a0c0d",
            300: "#101114",
            400: "#15171a",
            500: "#1a1d21",
            600: "#484a4d",
            700: "#76777a",
            800: "#a3a5a6",
            900: "#d1d2d3"   // Lightest grey
        },
        primary: {
          100: "#0d030d",  // Darkest primary
          200: "#19061a",
          300: "#260826",
          400: "#320b33",
          500: "#3f0e40",
          600: "#653e66",
          700: "#8c6e8c",
          800: "#b29fb3",
          900: "#d9cfd9"   // Lightest primary
        },
        greenAccent: {
          100: "#0f2922",  // Darkest green accent
          200: "#1e5245",
          300: "#2e7c67",
          400: "#3da58a",
          500: "#4cceac",
          600: "#70d8bd",
          700: "#94e2cd",
          800: "#b7ebde",
          900: "#dbf5ee"   // Lightest green accent
        },
        redAccent: {
          100: "#2c100f",  // Darkest red accent
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb"   // Lightest red accent
        },
        blueAccent: {
          100: "#151632",  // Darkest blue accent
          200: "#2a2d64",
          300: "#3e4396",
          400: "#535ac8",
          500: "#6870fa",
          600: "#868dfb",
          700: "#a4a9fc",
          800: "#c3c6fd",
          900: "#e1e2fe"   // Lightest blue accent
        },
      }),
});

// mui theme settings

export const themeSettings = (mode) => {
  const colors = tokens(mode);

  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.grey[500],
            },
          }
        : {
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#fcfcfc",
            },
          }),
    },
    typography: {
      fontFamily: ["Lato", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Lato", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Lato", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Lato", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Lato", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Lato", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Lato", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState(localStorage.getItem("mode") ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"));

  
  
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        {
          localStorage.setItem("mode", (mode === "light" ? "dark" : "light"))
          console.log(localStorage.getItem("mode"))
          setMode((prev) => (prev === "light" ? "dark" : "light"))
        },
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return [theme, colorMode];
};
