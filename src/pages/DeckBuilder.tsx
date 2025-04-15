import { useState, useEffect } from "react";
import axios from "axios";
import deckBuilderPrompt from "../lib/deckBuilderPrompt";

export async function generateDeckFromPrompt(
  prompt: string,
  suggestCommandersOnly: boolean
): Promise<string> {
  try {
    const content = suggestCommandersOnly
      ? `Suggest 5–10 real legendary creatures that would make strong Commanders for the theme: ${prompt}`
      : `Build a 100-card Commander deck that includes a single commander and is based on: ${prompt}`;

    console.log("🧠 Prompt to OpenAI:", content);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          { role: "system", content: deckBuilderPrompt },
          { role: "user", content },
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

  const handleDeckGenerate = async () => {
    if (!deckPrompt.trim()) return;
    setLoading(true);
    const result = await generateDeckFromPrompt(
      deckPrompt,
      suggestCommandersOnly
    );
    setDeckList(result);
    setLoading(false);
  };

  useEffect(() => {
    setDeckList("");
    if (deckPrompt.trim()) {
      handleDeckGenerate();
    }
  }, [suggestCommandersOnly]);

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
        <pre className="mt-8 max-w-2xl mx-auto bg-black/5 dark:bg-white/5 p-4 rounded text-sm whitespace-pre-wrap">
          {deckList}
        </pre>
      ) : null}
    </div>
  );
};

export default DeckBuilder;
