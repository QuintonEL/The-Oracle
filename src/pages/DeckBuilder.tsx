import { useState, useEffect } from "react";
import axios from "axios";
import deckBuilderPrompt from "../lib/deckBuilderPrompt";

export async function generateDeckFromPrompt(prompt: string): Promise<string> {
  try {
    console.log("🧠 Prompt to OpenAI:", prompt);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          { role: "system", content: deckBuilderPrompt },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices?.[0]?.message?.content?.trim();
    return text || "";
  } catch (err) {
    console.error("Deck build error:", err);
    return "";
  }
}

const DeckBuilder = () => {
  const [deckPrompt, setDeckPrompt] = useState("");
  const [deckList, setDeckList] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestCommandersOnly, setSuggestCommandersOnly] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [commanderName, setCommanderName] = useState("");

  const handleDeckGenerate = async () => {
    if (!deckPrompt.trim() && !commanderName.trim()) return;

    setLoading(true);

    const promptContent = suggestCommandersOnly
      ? `Suggest 5–10 real legendary creatures that would make strong Commanders for the theme: ${deckPrompt}`
      : commanderName.trim()
      ? `Build a 100-card Commander deck centered on "${commanderName}". Include that card as the Commander and build synergistic support cards.`
      : `Build a 100-card Commander deck that includes a single commander and is based on: ${deckPrompt}`;

    const result = await generateDeckFromPrompt(promptContent);

    setDeckList(result);
    setLoading(false);
  };

  useEffect(() => {
    setDeckList("");
    if (deckPrompt.trim()) {
      handleDeckGenerate();
    }
  }, [suggestCommandersOnly]);

  useEffect(() => {
    // ADDED: Track component mount state
    let isMounted = true;

    if (hoveredCard) {
      const fetchImage = async () => {
        try {
          // ADDED: Debug logging
          console.log("Fetching image for:", hoveredCard);

          // MODIFIED: Changed from exact to fuzzy search for better results
          const res = await fetch(
            `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
              hoveredCard
            )}`
          );

          // ADDED: Better error handling
          if (!res.ok) {
            throw new Error(`Failed to fetch card: ${res.statusText}`);
          }

          const data = await res.json();

          // ADDED: Check if component is still mounted
          if (isMounted) {
            const imageUrl =
              data.image_uris?.normal ||
              data.card_faces?.[0]?.image_uris?.normal;

            // ADDED: Debug logging
            console.log("Found image URL:", imageUrl);
            setCardImageUrl(imageUrl || null);
          }
        } catch (err) {
          console.error("Card image fetch failed:", err);
          // ADDED: Check if component is still mounted
          if (isMounted) {
            setCardImageUrl(null);
          }
        }
      };

      fetchImage();
    } else {
      setCardImageUrl(null);
    }

    // ADDED: Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [hoveredCard]);

  return (
    <div
      className="min-h-screen px-4 py-12 transition-colors duration-300
      bg-gradient-to-br from-[#f0f4f8] to-[#e4eaf1] 
      dark:from-[#1a1c2c] dark:via-[#3a3c4c] dark:to-black
      text-black dark:text-white flex flex-col items-center"
    >
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-4">🧠 Commander Deck Builder</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
          Describe a Commander deck idea like{" "}
          <span className="italic">"mono-blue control"</span> or{" "}
          <span className="italic">"vampire tribal with lifegain"</span>. The
          Oracle will brew something for you.
        </p>

        <textarea
          rows={4}
          value={deckPrompt}
          onChange={(e) => setDeckPrompt(e.target.value)}
          placeholder="e.g. mono-black discard and sacrifice deck"
          className="w-full p-4 rounded-xl bg-white/90 dark:bg-gray-800 border dark:border-gray-700 text-black dark:text-white shadow-md backdrop-blur-md transition focus:outline-none focus:ring-4 focus:ring-purple-500/30"
        />

        <div className="mt-4">
          <label
            htmlFor="commanderName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Specific Commander (optional)
          </label>
          <input
            id="commanderName"
            type="text"
            placeholder="e.g. Teysa Karlov"
            value={commanderName}
            onChange={(e) => setCommanderName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800 border dark:border-gray-700 text-black dark:text-white shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        <div className="flex items-center justify-center gap-3 my-4 text-sm text-gray-600 dark:text-gray-400">
          <label htmlFor="suggestOnly">Suggest Commanders Only</label>
          <input
            id="suggestOnly"
            type="checkbox"
            checked={suggestCommandersOnly}
            onChange={() => setSuggestCommandersOnly(!suggestCommandersOnly)}
            className="w-5 h-5 accent-purple-600"
          />
        </div>

        <button
          onClick={handleDeckGenerate}
          disabled={loading}
          className={`mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-transform ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
          }`}
        >
          🔮 {loading ? "Summoning..." : "Generate Deck"}
        </button>

        {loading && (
          <div className="mt-10 w-full max-w-3xl animate-pulse">
            <div className="bg-black/10 dark:bg-white/10 h-6 rounded w-1/2 mb-4 mx-auto" />
            <div className="space-y-3">
              <div className="bg-black/10 dark:bg-white/10 h-4 rounded w-full" />
              <div className="bg-black/10 dark:bg-white/10 h-4 rounded w-[90%]" />
              <div className="bg-black/10 dark:bg-white/10 h-4 rounded w-[95%]" />
              <div className="bg-black/10 dark:bg-white/10 h-4 rounded w-[85%]" />
              <div className="bg-black/10 dark:bg-white/10 h-4 rounded w-[60%]" />
            </div>
          </div>
        )}
      </div>

      {deckList && suggestCommandersOnly ? (
        <ul className="mt-8 max-w-2xl mx-auto bg-black/5 dark:bg-white/5 p-4 rounded text-sm space-y-2">
          {deckList.split("\n").map((line, i) => (
            <li key={i} className="border-b border-white/10 pb-2">
              🧙‍♂️ {line}
            </li>
          ))}
        </ul>
      ) : deckList.trim() ? (
        <div className="mt-8 max-w-2xl mx-auto bg-black/5 dark:bg-white/5 p-4 rounded text-sm whitespace-pre-wrap space-y-1">
          {deckList.split("\n").map((line, i) => {
            const trimmed = line.trim();
            // MODIFIED: Improved regex to catch more card formats
            const isCardLine =
              (/^[-–•] /.test(trimmed) || /^\d+x /.test(trimmed)) &&
              !/^(Commander|Creatures|Spells|Artifacts|Lands|Enchantments|Planeswalkers|Estimated Power Level)/i.test(
                trimmed
              );

            let cardName = null;

            // ADDED: Better card name extraction
            if (isCardLine) {
              cardName = trimmed
                .replace(/^[-–•] /, "") // Remove dash prefix
                .replace(/^\d+x /, "") // Remove quantity prefix
                .trim();
            }

            return (
              <div
                key={i}
                // MODIFIED: Added conditional cursor styling
                className={`relative group ${cardName ? "cursor-pointer" : ""}`}
                onMouseEnter={() => cardName && setHoveredCard(cardName)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <span
                  className={
                    isCardLine
                      ? "hover:underline cursor-pointer text-purple-500 group-hover:font-semibold"
                      : "text-gray-800 dark:text-gray-300 font-semibold"
                  }
                >
                  {line}
                </span>

                {cardImageUrl && hoveredCard === cardName && cardName && (
                  // MODIFIED: Changed positioning for more reliable display
                  <div
                    className="fixed z-50"
                    style={{
                      left: "calc(50% + 200px)",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <img
                      src={cardImageUrl || "/placeholder.svg"}
                      alt={cardName}
                      className="w-64 h-auto rounded-lg shadow-lg"
                      // ADDED: Error handling for image loading
                      onError={(e) => {
                        console.error("Image failed to load:", e);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
      {/* ADDED: Debug indicator */}
      {hoveredCard && (
        <div className="fixed bottom-4 right-4 bg-black/70 text-white p-2 rounded text-xs z-50">
          Hovering: {hoveredCard}
        </div>
      )}
    </div>
  );
};

export default DeckBuilder;
