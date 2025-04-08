import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CardSearch from "./components/CardSearch";
import AboutPage from "./pages/AboutPage";
import NavBar from "./components/NavBar";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<CardSearch />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
