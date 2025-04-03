// src/components/CardSearch.tsx
import React, { useState, useEffect } from "react";
import "tailwindcss";

interface Card {
  id: string;
  name: string;
  imageUrl?: string;
}

const CardSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  const searchCards = async (name: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.magicthegathering.io/v1/cards?name=${encodeURIComponent(
          name
        )}`
      );
      const data = await response.json();
      setCards(data.cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      setCards([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim()) {
        searchCards(query);
      } else {
        setCards([]);
      }
    }, 500); // debounce

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-center drop-shadow-lg">
        🔍 Magic Card Search
      </h1>
      <input
        type="text"
        placeholder="Enter card name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md p-3 rounded-xl border border-purple-400 bg-gray-800 text-white placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
      />
      {loading && <p className="mt-4">Loading...</p>}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {cards.slice(0, 12).map((card) => (
          <div
            key={card.id}
            className="bg-gray-800 rounded-xl p-4 shadow-lg hover:scale-105 transform transition"
          >
            <h2 className="text-lg font-semibold mb-2">{card.name}</h2>
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="rounded-md max-w-full"
              />
            ) : (
              <p className="text-sm text-gray-400">No image available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSearch;
