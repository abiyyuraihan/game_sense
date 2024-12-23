import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameRecommendationApp from "./components/GameRecomendationApp";

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameRecommendationApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
