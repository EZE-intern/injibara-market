import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-brand-400 cursor-pointer ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun size={20} className="text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon size={20} className="text-gray-600 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
