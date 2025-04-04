import { useEffect, useState } from "react";

const CardSearch = () => {
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen transition-colors bg-gradient-to-br from-purple-100 via-gray-200 to-white dark:from-purple-950 dark:via-gray-900 dark:to-black flex flex-col items-center justify-center px-4">
      {/* Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 bg-gray-300 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded-full shadow hover:scale-105 transition"
      >
        {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* Search */}
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-8 drop-shadow-lg">
          🔍 Magic: The Gathering Search
        </h1>
        <input
          type="text"
          placeholder="Enter card name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-6 py-4 text-lg text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900 border-2 border-purple-500 rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500 transition duration-300"
        />
      </div>
    </div>
  );
};

export default CardSearch;
