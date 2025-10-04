import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Helper function to get initial theme
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  // Always start with light theme for testing
  return "light";
};

// Helper function to apply theme immediately to prevent flash
const applyThemeToDocument = (theme: Theme) => {
  const root = document.documentElement;

  // Clear any existing theme classes and attributes
  root.classList.remove("dark", "light");
  root.removeAttribute("data-theme");

  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }

  console.log(
    `Theme applied: ${theme}, classList: ${root.classList.toString()}`
  );
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<Theme>(() => {
    const initialTheme = getInitialTheme();
    // Apply theme immediately to prevent flash
    if (typeof window !== "undefined") {
      applyThemeToDocument(initialTheme);
    }
    return initialTheme;
  });

  useEffect(() => {
    // Clear any existing theme on first load for testing
    if (isLoading) {
      localStorage.removeItem("theme");
    }

    // Apply theme changes to document
    applyThemeToDocument(theme);

    // Save to localStorage
    localStorage.setItem("theme", theme);

    // Set loading to false after first render
    setIsLoading(false);
  }, [theme, isLoading]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no theme is saved in localStorage
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
