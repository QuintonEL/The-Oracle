import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";

interface Card {
  id: string;
  name: string;
  type_line?: string;
  oracle_text?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
  prints_search_uri: string;
  set_name?: string;
  collector_number?: string;
  card_faces?: {
    name: string;
    oracle_text?: string;
    type_line?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
    };
  }[];
}

const SkeletonCard = () => (
  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg animate-pulse">
    <div className="w-full h-64 bg-gray-300 dark:bg-gray-600" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
    </div>
  </div>
);

const CardSearch = () => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [alternatePrintings, setAlternatePrintings] = useState<Card[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  // Auto-apply dark mode on load
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

  const searchCards = async (name: string) => {
    setLoading(true);

    try {
      const parts = [];

      if (name) parts.push(name); // full-text name search

      const query = parts.join(" ");
      const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
        query
      )}`;
      console.log("Fetching:", url); // for debug

      const res = await fetch(url);
      const data = await res.json();

      setCards(data.data); // Scryfall stores results in data.data
    } catch (err) {
      console.error("Error fetching from Scryfall:", err);
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
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    setIsFlipped(false); // reset flip every time a new card opens
    const fetchAlternates = async () => {
      if (selectedCard?.prints_search_uri) {
        try {
          const res = await fetch(selectedCard.prints_search_uri);
          const data = await res.json();
          setAlternatePrintings(data.data);
        } catch (err) {
          console.error("Error fetching alternate printings:", err);
        }
      } else {
        setAlternatePrintings([]);
      }
    };

    fetchAlternates();
  }, [selectedCard]);

  return (
    <div
      className="min-h-screen px-4 py-10 transition-colors duration-300
      bg-gradient-to-br from-[#f0f4f8] to-[#e4eaf1] 
      dark:from-[#1a1c2c] dark:via-[#3a3c4c] dark:to-black
      text-black dark:text-white"
    >
      {" "}
      {/* Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 bg-gray-300 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded-full shadow hover:scale-105 transition"
      >
        {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      {/* Search Bar */}
      <div className="w-full max-w-xl mx-auto text-center mb-10">
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight drop-shadow-sm dark:drop-shadow-lg">
          MTG Card Finder
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 italic mb-6">
          Discover cards across the Multiverse by name, color, or type.
        </p>
        <input
          type="text"
          placeholder="Search for a card..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full max-w-xl mx-auto
            px-6 py-4
            rounded-xl
            bg-white/80 dark:bg-gray-900/80
            border border-gray-300 dark:border-gray-700
            text-lg text-gray-800 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-4 focus:ring-purple-500/40
            shadow-md backdrop-blur-md
            transition duration-300
          "
        />
      </div>
      {/* Loading state */}
      {loading && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      {/* Cards Grid */}
      {!loading && cards.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
          {cards.map((card) => (
            <Tilt
              key={card.id}
              glareEnable
              glareMaxOpacity={0.15}
              glareColor="#ffffff"
              glarePosition="all"
              scale={1.05}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              transitionSpeed={500}
              className="rounded-xl"
              style={{ borderRadius: "1rem", overflow: "hidden" }}
            >
              <div
                onClick={() => setSelectedCard(card)}
                className="overflow-hidden rounded-xl cursor-pointer transition duration-300 shadow-lg bg-white dark:bg-gray-800"
              >
                <img
                  src={
                    card.image_uris?.normal ||
                    card.card_faces?.[0]?.image_uris?.normal ||
                    "" // fallback if nothing exists
                  }
                  alt={card.name}
                  className="w-full object-cover"
                />
              </div>
            </Tilt>
          ))}
        </div>
      )}
      {/* Modal */}
      {selectedCard &&
        (() => {
          const faces = selectedCard.card_faces;
          const isDoubleFaced =
            Array.isArray(faces) &&
            faces.length === 2 &&
            faces[0]?.image_uris?.large &&
            faces[1]?.image_uris?.large;

          return (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setSelectedCard(null)}
            >
              <div
                className="relative bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-xl w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto modal-scroll"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Card Image */}
                {isDoubleFaced ? (
                  <div
                    className="relative w-full aspect-[3/4] perspective mb-4 cursor-pointer"
                    onClick={() => setIsFlipped((prev) => !prev)}
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Front Face */}
                      <div className="absolute inset-0 backface-hidden z-20">
                        <img
                          src={faces![0].image_uris!.large}
                          alt={faces![0].name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Back Face */}
                      <div className="absolute inset-0 rotate-y-180 backface-hidden z-10">
                        <img
                          src={faces![1].image_uris!.large}
                          alt={faces![1].name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={selectedCard.image_uris?.large || ""}
                    alt={selectedCard.name}
                    className="w-full rounded-lg mb-4"
                  />
                )}

                {/* Card Name */}
                <h2 className="text-2xl font-bold mb-2">{selectedCard.name}</h2>

                {/* Type Line */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedCard.type_line ||
                    selectedCard.card_faces?.[0]?.type_line}
                </p>

                {/* Oracle Text */}
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedCard.oracle_text ||
                    selectedCard.card_faces?.[0]?.oracle_text ||
                    "No text available."}
                </p>

                {/* Alternate Printings */}
                {alternatePrintings.length > 1 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">
                      Other Versions
                    </h3>
                    <div className="flex overflow-x-auto gap-4 pb-2 modal-scroll">
                      {alternatePrintings.map((version) => (
                        <img
                          key={version.id}
                          src={
                            version.image_uris?.small ||
                            version.card_faces?.[0]?.image_uris?.small ||
                            ""
                          }
                          alt={version.name}
                          title={`${version.set_name} — #${version.collector_number}`}
                          className="w-24 h-auto rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => setSelectedCard(version)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default CardSearch;
