import React, { createContext, useContext, useEffect, useState } from "react";
import { createThemeClasses } from "../lib/color-system";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  classes: ReturnType<typeof createThemeClasses>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or default to light
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("mockify-theme") as Theme;
      return savedTheme === "dark" ? "dark" : "light";
    }
    return "light";
  });

  // Apply theme to document root - ONLY touch the HTML element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;

    // Clean approach: only manage the 'dark' class on html element
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("mockify-theme", theme);

    console.log(
      "✅ Theme applied:",
      theme,
      "HTML classes:",
      html.classList.toString()
    );
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const classes = createThemeClasses(theme);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    classes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
