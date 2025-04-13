import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CardSearch from "./pages/CardSearch";
import AboutPage from "./pages/AboutPage";
import NavBar from "./components/NavBar";
import DeckBuilder from "./pages/DeckBuilder";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<CardSearch />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/deck-builder" element={<DeckBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;
