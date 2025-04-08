import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur border-b border-gray-300 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-purple-700 dark:text-purple-300"
        >
          MTG Search
        </Link>

        <div className="flex gap-6 text-sm">
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
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
