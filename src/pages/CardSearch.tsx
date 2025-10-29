"use client";

import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useTypewriter } from "react-simple-typewriter";
import Footer from "../components/Footer";
import systemPrompt from "../lib/systemPrompt";
import { normalizeScryfallQuery } from "../utils/normalizeScryfallQuery";
import { Share2, Copy, Check } from "lucide-react";

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
  // Add price data to the Card interface
  prices?: {
    usd?: string | null;
    usd_foil?: string | null;
    usd_etched?: string | null;
    eur?: string | null;
    eur_foil?: string | null;
    tix?: string | null;
  };
  // Add rarity for additional context
  rarity?: string;
  // Add scryfall URI for sharing
  scryfall_uri?: string;
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
  const trimmed = input.trim();
  const wordCount = trimmed.split(/\s+/).length;

  // Let simple one-word queries pass as likely names
  if (wordCount === 1) return true;

  // If it has known Scryfall-style syntax, it's NOT a card name
  const scryfallSyntax =
    /(\bc:|\btype:|\bo:|\bcmc[<=>]|\bpower[<=>]|\btoughness[<=>])/.test(
      trimmed
    );
  if (scryfallSyntax) return false;

  // Fallback to keyword-based check
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
    "mill",
    "mono",
    "graveyard",
    "lifelink",
    "discard",
    "sacrifice",
  ];

  const containsKeyword = keywords.some((kw) =>
    trimmed.toLowerCase().includes(kw)
  );
  return !containsKeyword;
}

// Helper function to format price with currency
const formatPrice = (
  price: string | null | undefined,
  exchangeRate: number,
  currency = "C$"
) => {
  if (!price) return "N/A";
  const priceInCAD = Number.parseFloat(price) * exchangeRate;
  return `${currency}${priceInCAD.toFixed(2)}`;
};

// Calculate total deck price - keeping this function in case it's needed later
// const calculateTotalPrice = (cards: Card[], exchangeRate: number): number => {
//   return cards.reduce((total, card) => {
//     const price = card.prices?.usd
//       ? Number.parseFloat(card.prices.usd) * exchangeRate
//       : 0;
//     return total + price;
//   }, 0);
// };

const CardSearch = () => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [alternatePrintings, setAlternatePrintings] = useState<Card[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [queryError, setQueryError] = useState<string | null>(null);
  const [showPrices, setShowPrices] = useState(true);
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("name");
  const [exchangeRate, setExchangeRate] = useState<number>(1.35); // Default USD to CAD rate
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [shareStatus, setShareStatus] = useState<
    "idle" | "copied" | "shared" | "error"
  >("idle");

  // Fetch exchange rate on component mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoadingRate(true);
      try {
        // Using ExchangeRate-API for USD to CAD conversion
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data.rates && data.rates.CAD) {
          setExchangeRate(data.rates.CAD);
          console.log("Exchange rate USD to CAD:", data.rates.CAD);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        // Keep the default rate if there's an error
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  // Theme is now managed by Redux

  // Reset share status after a delay
  useEffect(() => {
    if (shareStatus === "copied" || shareStatus === "shared") {
      const timer = setTimeout(() => {
        setShareStatus("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shareStatus]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);

    let scryfallQuery = "";

    if (isLikelyCardName(query)) {
      console.log("🧩 Using fuzzy card name search");
      setAiQuery(query);
      scryfallQuery = query;
    } else {
      console.log("🔮 Using OpenAI smart query");
      const aiResult = await getScryfallQueryFromOpenAI(query);
      setAiQuery(aiResult);

      scryfallQuery = normalizeScryfallQuery(aiResult);

      if (
        !scryfallQuery.includes("c:") &&
        !scryfallQuery.includes("type:") &&
        !scryfallQuery.includes("o:")
      ) {
        console.warn("⚠️ AI fallback triggered — using raw input");
        setAiQuery(query);
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

  // Handle sharing a card
  const handleShareCard = async () => {
    if (!selectedCard) return;

    const shareUrl =
      selectedCard.scryfall_uri ||
      `https://scryfall.com/card/${selectedCard.id}`;
    const shareTitle = `Check out this MTG card: ${selectedCard.name}`;
    const shareText = `${selectedCard.name} - ${selectedCard.type_line || ""}`;

    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareStatus("shared");
      } catch (error) {
        console.error("Error sharing:", error);
        // Fall back to clipboard if sharing fails
        copyToClipboard(shareUrl);
      }
    } else {
      // Fall back to clipboard if Web Share API is not available
      copyToClipboard(shareUrl);
    }
  };

  // Helper function to copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setShareStatus("copied");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        setShareStatus("error");
      });
  };

  // Filter and sort cards based on price
  const filteredAndSortedCards = [...cards]
    .filter((card) => {
      if (priceFilter === "all") return true;
      const priceInCAD =
        Number.parseFloat(card.prices?.usd || "0") * exchangeRate;
      if (priceFilter === "under5") return priceInCAD < 5;
      if (priceFilter === "5to20") return priceInCAD >= 5 && priceInCAD <= 20;
      if (priceFilter === "over20") return priceInCAD > 20;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "name") return a.name.localeCompare(b.name);
      if (sortOrder === "price-low") {
        return (
          Number.parseFloat(a.prices?.usd || "0") * exchangeRate -
          Number.parseFloat(b.prices?.usd || "0") * exchangeRate
        );
      }
      if (sortOrder === "price-high") {
        return (
          Number.parseFloat(b.prices?.usd || "0") * exchangeRate -
          Number.parseFloat(a.prices?.usd || "0") * exchangeRate
        );
      }
      if (sortOrder === "rarity") {
        const rarityOrder = { common: 0, uncommon: 1, rare: 2, mythic: 3 };
        return (
          (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0) -
          (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0)
        );
      }
      return 0;
    });

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

        {isLoadingRate && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Loading exchange rate...
          </p>
        )}
        {!isLoadingRate && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Prices shown in CAD (1 USD = {exchangeRate.toFixed(2)} CAD)
          </p>
        )}
      </div>
      {/* Price Controls */}
      {cards.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/10 dark:bg-black/20 p-4 rounded-lg">
            <div className="flex items-center">
              <label className="mr-2 text-sm">Show Prices:</label>
              <input
                type="checkbox"
                checked={showPrices}
                onChange={() => setShowPrices(!showPrices)}
                className="w-4 h-4 accent-purple-600"
              />
            </div>

            <div className="flex items-center">
              <label className="mr-2 text-sm">Price Filter:</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="bg-white/80 dark:bg-gray-800 text-sm rounded px-2 py-1 border border-gray-300 dark:border-gray-700"
              >
                <option value="all">All Prices</option>
                <option value="under5">Under C$5</option>
                <option value="5to20">C$5 - C$20</option>
                <option value="over20">Over C$20</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="mr-2 text-sm">Sort By:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white/80 dark:bg-gray-800 text-sm rounded px-2 py-1 border border-gray-300 dark:border-gray-700"
              >
                <option value="name">Name</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>
          </div>
        </div>
      )}
      {/* Results Count */}
      {!isLoading && filteredAndSortedCards.length > 0 && (
        <div className="max-w-6xl mx-auto mb-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Showing{" "}
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {filteredAndSortedCards.length}
            </span>
            {filteredAndSortedCards.length !== cards.length && (
              <>
                {" "}
                of <span className="font-semibold">{cards.length}</span>
              </>
            )}{" "}
            results{" "}
            {query && (
              <>
                for <span className="italic">"{query}"</span>
              </>
            )}
          </p>
        </div>
      )}
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
      {!isLoading && filteredAndSortedCards.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
          {filteredAndSortedCards.map((card) => (
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
                    "/placeholder.svg" ||
                    "/placeholder.svg"
                  }
                  alt={card.name}
                  className="w-full object-cover"
                />

                {/* Price Badge */}
                {showPrices && card.prices?.usd && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    C$
                    {(
                      Number.parseFloat(card.prices.usd) * exchangeRate
                    ).toFixed(2)}
                  </div>
                )}

                {/* Rarity Badge */}
                {card.rarity && (
                  <div
                    className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-semibold
                    ${
                      card.rarity === "common"
                        ? "bg-gray-500/70 text-white"
                        : card.rarity === "uncommon"
                        ? "bg-blue-500/70 text-white"
                        : card.rarity === "rare"
                        ? "bg-yellow-500/70 text-black"
                        : "bg-orange-500/70 text-white"
                    }`}
                  >
                    {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
                  </div>
                )}
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
                          src={
                            faces![0].image_uris!.large || "/placeholder.svg"
                          }
                          alt={faces![0].name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Back Face */}
                      <div className="absolute inset-0 rotate-y-180 backface-hidden z-10">
                        <img
                          src={
                            faces![1].image_uris!.large || "/placeholder.svg"
                          }
                          alt={faces![1].name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={selectedCard.image_uris?.large || ""}
                      alt={selectedCard.name}
                      className="w-full rounded-lg mb-4"
                    />
                  </div>
                )}

                {/* Card Header with Name and Share Button */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">{selectedCard.name}</h2>

                  {/* Share Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareCard();
                    }}
                    className="flex items-center justify-center p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 transition-colors"
                    title="Share this card"
                  >
                    {shareStatus === "idle" && <Share2 size={18} />}
                    {shareStatus === "copied" && (
                      <Check
                        size={18}
                        className="text-green-600 dark:text-green-400"
                      />
                    )}
                    {shareStatus === "shared" && (
                      <Check
                        size={18}
                        className="text-green-600 dark:text-green-400"
                      />
                    )}
                    {shareStatus === "error" && (
                      <Copy
                        size={18}
                        className="text-red-600 dark:text-red-400"
                      />
                    )}
                  </button>
                </div>

                {/* Share Status Message */}
                {shareStatus === "copied" && (
                  <div className="mb-2 text-xs text-green-600 dark:text-green-400 text-right">
                    Link copied to clipboard!
                  </div>
                )}
                {shareStatus === "shared" && (
                  <div className="mb-2 text-xs text-green-600 dark:text-green-400 text-right">
                    Card shared successfully!
                  </div>
                )}
                {shareStatus === "error" && (
                  <div className="mb-2 text-xs text-red-600 dark:text-red-400 text-right">
                    Couldn't share. Try again.
                  </div>
                )}

                {/* Type Line */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedCard.type_line ||
                    selectedCard.card_faces?.[0]?.type_line}
                </p>

                {/* Price Information */}
                {selectedCard.prices && (
                  <div className="mt-2 mb-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Price Information (CAD)
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Regular:
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatPrice(
                            selectedCard.prices.usd,
                            exchangeRate,
                            "C$"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Foil:
                        </span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {formatPrice(
                            selectedCard.prices.usd_foil,
                            exchangeRate,
                            "C$"
                          )}
                        </span>
                      </div>
                      {selectedCard.prices.usd_etched && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Etched:
                          </span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {formatPrice(
                              selectedCard.prices.usd_etched,
                              exchangeRate,
                              "C$"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                      {alternatePrintings.map((version: Card) => (
                        <div key={version.id} className="relative">
                          <img
                            src={
                              version.image_uris?.small ||
                              version.card_faces?.[0]?.image_uris?.small ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={version.name}
                            title={`${version.set_name} — #${version.collector_number}`}
                            className="w-24 h-auto rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setSelectedCard(version)}
                          />
                          {version.prices?.usd && (
                            <div className="absolute bottom-0 right-0 bg-black/70 text-white px-1 py-0.5 text-xs rounded-bl-lg rounded-tr-lg">
                              C$
                              {(
                                Number.parseFloat(version.prices.usd) *
                                exchangeRate
                              ).toFixed(2)}
                            </div>
                          )}
                        </div>
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
