# 🧙‍♂️ The Oracle

**The Oracle** is an AI-powered Magic: The Gathering card search experience.

Just describe the card you're imagining — and The Oracle will interpret your words using OpenAI, then find real cards from the multiverse using the Scryfall API.

> Example: _"a red instant that deals damage"_  
> → Interpreted as: `c:r type:instant o:damage`

---

## ✨ Features

- 🧠 Natural language card search powered by OpenAI
- 🎴 3D tilt effects with flip animations for double-faced cards
- 🌗 Dark/light mode toggle with persistent theme
- ⏳ Skeleton loaders for smooth UX while fetching
- 📦 Integration with the [Scryfall API](https://scryfall.com/docs/api) for up-to-date card data
- ⚡ Fast, responsive UI built with Vite + Tailwind CSS

---

## 🧰 Tech Stack

- ⚛️ React + TypeScript
- 💨 Tailwind CSS
- 🔮 OpenAI API (GPT-3.5)
- 🃏 Scryfall API
- 🌀 [react-parallax-tilt](https://www.npmjs.com/package/react-parallax-tilt)
- ⚡ Vite for blazing-fast builds

---

## 📸 Preview

> _(Replace with a screenshot or GIF showing search in action)_

![The Oracle Screenshot](./screenshot.png)

---

## 🚀 Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/yourusername/the-oracle.git
cd the-oracle
npm install
```

Create a `.env` file with your [OpenAI API Key](https://platform.openai.com/account/api-keys):

```
VITE_OPENAI_API_KEY=sk-...
```

Start the development server:

```bash
npm run dev
```

---

## 🧙 Why I Built This

I wanted to reimagine what Magic: The Gathering search could feel like — intuitive, magical, and intelligent. The Oracle blends smart UI design with natural language AI to make finding cards effortless and fun. It's also a personal project to explore modern front-end architecture and LLM integrations.

---

## 🔗 Connect With Me

- GitHub: [@yourusername](https://github.com/QuintonEL)
- LinkedIn: [yourname](https://linkedin.com/in/quinton-laborde)

---

## 📜 License

MIT
