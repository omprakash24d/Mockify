import { useTheme } from "../contexts/ThemeContext";

export const ThemeDebug: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleDebugClick = () => {
    console.log("Current theme:", theme);
    console.log("HTML classes:", document.documentElement.classList.toString());
    console.log("Body classes:", document.body.classList.toString());
    console.log("Local storage theme:", localStorage.getItem("mockify-theme"));
    toggleTheme();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleDebugClick}
        className="bg-red-500 text-white px-4 py-2 rounded shadow-lg"
      >
        Debug Theme: {theme}
      </button>
      <div className="mt-2 text-xs bg-white dark:bg-gray-800 p-2 rounded shadow">
        <div>Current: {theme}</div>
        <div>HTML: {document.documentElement.classList.toString()}</div>
        <div>Body: {document.body.classList.toString()}</div>
      </div>
    </div>
  );
};
