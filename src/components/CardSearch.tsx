import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useTypewriter } from "react-simple-typewriter";
import Footer from "./Footer";
import systemPrompt from "../lib/systemPrompt";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // store this in .env

async function getScryfallQueryFromOpenAI(userQuery: string): Promise<string> {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `"${userQuery}"` },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content?.trim();
    console.log("Calling OpenAI with:", userQuery);
    console.log("Generated query:", reply);
    return reply || "";
  } catch (error) {
    console.error("OpenAI error:", error);
    return "";
  }
}

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

function isLikelyCardName(input: string): boolean {
  const wordCount = input.trim().split(/\s+/).length;
  const keywords = [
    "creature",
    "instant",
    "sorcery",
    "spell",
    "enchantment",
    "planeswalker",
    "artifact",
    "land",
    "flying",
    "haste",
    "trample",
    "flash",
    "draw",
    "destroy",
    "counter",
    "token",
    "mana",
    "cheap",
    "expensive",
    "big",
    "small",
  ];

  const lower = input.toLowerCase();
  const hasKeyword = keywords.some((word) => lower.includes(word));

  return wordCount <= 4 && !hasKeyword;
}

const CardSearch = () => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [alternatePrintings, setAlternatePrintings] = useState<Card[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [queryError, setQueryError] = useState<string | null>(null);

  // Auto-apply dark mode on load
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);

    let scryfallQuery = "";

    if (isLikelyCardName(query)) {
      console.log("🧩 Using fuzzy card name search");
      setAiQuery(query); // 👈 add this line!
      scryfallQuery = query;
    } else {
      console.log("🔮 Using OpenAI smart query");
      const aiResult = await getScryfallQueryFromOpenAI(query);
      setAiQuery(aiResult); // 👈 update here too
      scryfallQuery = aiResult;

      if (
        !scryfallQuery.includes("c:") &&
        !scryfallQuery.includes("type:") &&
        !scryfallQuery.includes("o:")
      ) {
        console.warn("⚠️ AI fallback triggered — using raw input");
        setAiQuery(query); // 👈 fallback display
        scryfallQuery = query;
      }
    }

    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
      scryfallQuery
    )}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          setQueryError(
            "😕 No cards matched that search. Try simplifying your phrase!"
          );
          setCards([]);
          return;
        } else {
          throw new Error(`Unexpected error: ${res.status}`);
        }
      }

      const data = await res.json();
      if (!data.data || data.data.length === 0) {
        setQueryError(
          "😕 I couldn't find any cards for that search. Try rephrasing!"
        );
        setCards([]); // Optional, in case you want to clear old results
      } else {
        setCards(data.data);
        setQueryError(null); // Clear any previous error
      }
    } catch (err) {
      console.error("Error fetching cards", err);
      setQueryError("❌ Something went wrong. Try again in a moment!");
    } finally {
      setIsLoading(false);
    }
  };

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

  const examples = [
    "a red spell that draws cards",
    "a flying black demon that creates tokens",
    "cheap blue counterspell",
    "big green dinosaurs",
    "a white enchantment that gains life",
  ];

  const [text] = useTypewriter({
    words: examples,
    loop: true,
    delaySpeed: 2500,
  });

  return (
    <div
      className="min-h-screen px-4 py-10 transition-colors duration-300
      bg-gradient-to-br from-[#f0f4f8] to-[#e4eaf1] 
      dark:from-[#1a1c2c] dark:via-[#3a3c4c] dark:to-black
      text-black dark:text-white"
    >
      {" "}
      {/* Search Bar */}
      <div className="w-full max-w-xl mx-auto text-center mb-10">
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight drop-shadow-sm dark:drop-shadow-lg">
          The Oracle
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 italic mb-6">
          Speak the spell. Find the card.
        </p>
        <input
          type="text"
          placeholder={text}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="w-full max-w-xl px-6 py-4 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-700 text-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/40 shadow-md backdrop-blur-md transition"
        />
        {aiQuery && (
          <p className="mt-2 text-sm text-purple-700 dark:text-purple-300 italic">
            🤖 <span className="font-mono">{aiQuery}</span>
          </p>
        )}

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`mt-4 px-6 py-3 rounded-xl shadow-md transition 
    ${
      isLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-purple-600 hover:bg-purple-700 text-white"
    }
  `}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      {queryError && (
        <div className="mt-4 text-red-600 dark:text-red-400 text-sm italic text-center">
          {queryError}
        </div>
      )}
      {/* Cards Grid */}
      {!isLoading && cards.length > 0 && (
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
      <Footer />
    </div>
  );
};

export default CardSearch;
