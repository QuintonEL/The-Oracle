import React from "react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e4eaf1] dark:from-[#1a1c2c] dark:via-[#3a3c4c] dark:to-black text-black dark:text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold mb-2">About This Project</h1>

        <p className="text-lg text-gray-800 dark:text-gray-300">
          This is a Magic: The Gathering card search app built as a personal
          portfolio project to explore advanced front-end techniques and show
          off my love of MTG and UI polish.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Why I Built This</h2>
        <p className="text-gray-700 dark:text-gray-400">
          I wanted to create something more than just another Scryfall wrapper —
          something stylish, animated, responsive, and interactive, with unique
          features like 3D tilt, modal previews, flip animations for
          double-faced cards, and a beautiful dark/light mode toggle.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Tech Stack</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-400">
          <li>⚡ React + TypeScript</li>
          <li>🎨 Tailwind CSS</li>
          <li>🪞 react-parallax-tilt</li>
          <li>🧙‍♂️ Scryfall API</li>
          <li>🌑 Dark mode with custom themes</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">Features</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-400">
          <li>🔍 Real-time card search</li>
          <li>🎴 Modal previews with double-faced card flipping</li>
          <li>🌀 Smooth 3D hover effects</li>
          <li>✨ Light/dark Aether-themed UI</li>
          <li>🧾 Filter and loading states</li>
        </ul>

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
