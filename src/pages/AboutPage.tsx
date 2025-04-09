const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e4eaf1] dark:from-[#1a1c2c] dark:via-[#3a3c4c] dark:to-black text-black dark:text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300">
          About The Oracle
        </h1>

        <p className="text-lg text-gray-800 dark:text-gray-300">
          <strong>The Oracle</strong> is an AI-powered Magic: The Gathering
          search experience. Just describe the card you're imagining — and The
          Oracle will interpret your words into real, playable cards using
          OpenAI and Scryfall.
        </p>

        <h2 className="text-2xl font-semibold mt-6">How It Works</h2>
        <p className="text-gray-700 dark:text-gray-400">
          When you type a phrase like{" "}
          <em>“a flying vampire that creates tokens”</em> or{" "}
          <em>“cheap blue counterspell”</em>, The Oracle sends your query to
          OpenAI, which translates it into precise Scryfall syntax (like{" "}
          <code>c:u type:instant o:counter cmc&lt;=2</code>). This lets users
          search using pure intent — no advanced syntax required.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Features</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-400">
          <li>🧠 Natural language search powered by OpenAI</li>
          <li>🎴 Interactive card previews with 3D tilt and flip animations</li>
          <li>🌗 Persistent dark mode with aether-inspired design</li>
          <li>⏳ Skeleton loading for smooth UX</li>
          <li>
            📦 Scryfall API integration for accurate and up-to-date card data
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">Tech Stack</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-400">
          <li>⚛️ React + TypeScript</li>
          <li>💨 Tailwind CSS for styling</li>
          <li>🔮 OpenAI API for intelligent search parsing</li>
          <li>🃏 Scryfall API for comprehensive MTG data</li>
          <li>🌀 react-parallax-tilt for card effects</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">Why I Built This</h2>
        <p className="text-gray-700 dark:text-gray-400">
          The Oracle started as a passion project — I wanted to reimagine MTG
          search to feel more intuitive, magical, and smart. It's also a
          showcase of modern front-end tools and AI integration, combining
          beautiful UX with powerful functionality.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Connect</h2>
        <p className="text-gray-700 dark:text-gray-400">
          This is an open-source project. You can check it out on GitHub or
          connect with me:
        </p>
        <div className="flex gap-4 mt-2">
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/yourname"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
