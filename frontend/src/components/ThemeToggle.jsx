import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={
        isDark
          ? 'Switch to light theme'
          : 'Switch to dark theme'
      }
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg backdrop-blur-xl transition hover:bg-white/10 active:scale-95"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

export default ThemeToggle;