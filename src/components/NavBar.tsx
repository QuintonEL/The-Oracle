import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const NavBar = () => {
  const { pathname } = useLocation();
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem("theme") === "dark"
  );

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // apply theme on load
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <nav className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur border-b border-gray-300 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-purple-700 dark:text-purple-300"
        >
          MTG Search
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            className={`${
              pathname === "/"
                ? "text-purple-600 dark:text-purple-300"
                : "text-gray-600 dark:text-gray-400"
            } hover:text-purple-500 transition`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`${
              pathname === "/about"
                ? "text-purple-600 dark:text-purple-300"
                : "text-gray-600 dark:text-gray-400"
            } hover:text-purple-500 transition`}
          >
            About
          </Link>

          {/* 🌗 Discrete dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-purple-600" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
