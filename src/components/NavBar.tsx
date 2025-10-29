import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, selectIsDark } from "../store/themeSlice";

const NavBar = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const isDark = useSelector(selectIsDark);

  const toggleDarkMode = () => {
    dispatch(toggleTheme());
  };

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
            to="/deck-builder"
            className={`${
              pathname === "/deck-builder"
                ? "text-purple-600 dark:text-purple-300"
                : "text-gray-600 dark:text-gray-400"
            } hover:text-purple-500 transition`}
          >
            Deck Builder
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

          {/* 🌗 Dark mode toggle */}
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
