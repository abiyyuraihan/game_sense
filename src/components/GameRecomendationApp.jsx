import React, { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Gamepad2,
  ChevronDown,
  AlertCircle,
  Laptop,
  Globe,
  Star,
  UserMinus,
  Download,
  Zap,
  Terminal,
  Users,
  Joystick,
} from "lucide-react";

const GameRecommendationApp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [device, setDevice] = useState("");
  const [playMode, setPlayMode] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [moodDropdownOpen, setMoodDropdownOpen] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const [playModeDropdownOpen, setPlayModeDropdownOpen] = useState(false);
  const resultsRef = useRef(null);

  const initializeAI = () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "API key not configured. Please set the REACT_APP_GEMINI_API_KEY environment variable."
      );
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (error) {
      throw new Error(`Failed to initialize Gemini AI: ${error.message}`);
    }
  };

  const moods = [
    { id: "happy", name: "Mood: Happy" },
    { id: "sad", name: "Mood: Sad" },
    { id: "stressed", name: "Mood: Stressed" },
    { id: "excited", name: "Mood: Excited" },
    { id: "bored", name: "Mood: Bored" },
    { id: "lonely", name: "Mood: Lonely" },
    { id: "angry", name: "Mood: Angry" },
    { id: "relaxed", name: "Mood: Relaxed" },
    { id: "anxious", name: "Mood: Anxious" },
    { id: "creative", name: "Mood: Creative" },
  ];

  const genres = [
    { id: "action", name: "Action" },
    { id: "adventure", name: "Adventure" },
    { id: "rpg", name: "RPG" },
    { id: "strategy", name: "Strategy" },
    { id: "simulation", name: "Simulation" },
    { id: "sports", name: "Sports" },
    { id: "racing", name: "Racing" },
    { id: "puzzle", name: "Puzzle" },
    { id: "shooter", name: "Shooter" },
    { id: "platformer", name: "Platformer" },
  ];

  const devices = [
    { id: "pc", name: "Computer/Laptop" },
    { id: "mobile", name: "Mobile Phone" },
    { id: "playstation", name: "PlayStation" },
  ];

  const playModes = [
    { id: "single", name: "Single Player" },
    { id: "multi", name: "Multiplayer" },
    { id: "both", name: "Both" },
  ];

  const toggleMood = (moodId) => {
    setSelectedMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((id) => id !== moodId)
        : [...prev, moodId]
    );
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const safeParseJSON = (jsonString) => {
    try {
      const cleanedJson = jsonString
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();

      const parsed = JSON.parse(cleanedJson);

      if (parsed && parsed.recommendations) {
        return parsed;
      }

      throw new Error("Invalid JSON format");
    } catch (error) {
      console.error("Error Parsing JSON:", error);
      throw new Error(`Failed to parse recommendations: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      selectedMoods.length === 0 ||
      !device ||
      selectedGenres.length === 0 ||
      !playMode
    )
      return;

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const model = initializeAI();
      const prompt = `
      IMPORTANT: Answer EXACTLY in valid JSON format.
      DO NOT add comments or text outside the JSON structure.

      Provide game recommendations based on the following:
      - Mood: ${selectedMoods
        .map((id) => moods.find((m) => m.id === id)?.name)
        .join(", ")}
      - Genre: ${selectedGenres
        .map((id) => genres.find((g) => g.id === id)?.name)
        .join(", ")}
      - Device: ${device === "pc" ? "PC/Laptop" : "Mobile Phone"}
      - Play Mode: ${playModes.find((p) => p.id === playMode)?.name}

      Answer MUST be in valid JSON with this structure:
      {
        "recommendations": {
          "suggestedGenres": [
            {
              "name": "Genre Name",
              "description": "Why this genre matches the mood and preferences"
            }
          ],
          "onlineGames": [
            {
              "title": "Game Title",
              "genre": "Game Genre",
              "description": "Brief game description",
              "rating": "1-5",
              "price": "Free/Paid",
              "platform": "Platform name",
              "downloadUrl": "URL to download or buy the game",
              "storeType": "Steam/Epic/PlayStore/AppStore/etc",
              "playMode": "Single/Multi/Both"
            }
          ],
          "offlineGames": [
            {
              "title": "Game Title",
              "genre": "Game Genre",
              "description": "Brief game description",
              "rating": "1-5",
              "price": "Free/Paid",
              "platform": "Platform name",
              "downloadUrl": "URL to download or buy the game",
              "storeType": "Steam/Epic/PlayStore/AppStore/etc",
              "playMode": "Single/Multi/Both"
            }
          ],
          "moodBoostPotential": "High/Medium/Low",
          "recommendations": ["Specific gaming suggestions for the mood and preferences"]
        }
      }`;

      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();

      const parsedRecommendations = safeParseJSON(responseText);
      setRecommendations(parsedRecommendations.recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setError(`An error occurred: ${error.message}`);
    }

    setLoading(false);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-black via-purple-900 to-black">
      <header className="bg-black/90 border-b border-pink-500/30 fixed top-0 w-full z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Gamepad2 className="h-8 w-8 text-pink-500 animate-pulse" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-pink-500 font-mono">
                  GameSense
                </h1>
                <p className="text-sm text-cyan-400">
                  Interactive Game Recommendation System
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-pink-500 mb-4">
              Game Recommendations
            </h2>
            <p className="text-lg text-cyan-400 max-w-2xl mx-auto">
              Find games that match your current mood
            </p>
          </div>

          {error && (
            <div className="mb-8 bg-red-900/50 border border-red-500/50 rounded-xl p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">
                    Error Occurred
                  </h3>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-black/80 shadow-2xl shadow-pink-500/20 rounded-2xl border border-pink-500/30 max-w-3xl mx-auto backdrop-blur-lg">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-cyan-400 mb-2">
                    Mood
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMoodDropdownOpen(!moodDropdownOpen)}
                      className="w-full bg-black border border-pink-500/50 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    >
                      <span className="text-pink-500">
                        {selectedMoods.length > 0
                          ? `${selectedMoods.length} Moods Selected`
                          : "Select Mood"}
                      </span>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-500" />
                    </button>

                    {moodDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-black border border-pink-500/30 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        <div className="p-3 grid grid-cols-1 gap-2">
                          {moods.map((mood) => (
                            <label
                              key={mood.id}
                              className="flex items-center p-2 hover:bg-pink-500/10 rounded-lg cursor-pointer transition-colors duration-150"
                            >
                              <input
                                type="checkbox"
                                checked={selectedMoods.includes(mood.id)}
                                onChange={() => toggleMood(mood.id)}
                                className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-pink-500 rounded bg-black"
                              />
                              <span className="ml-2 text-sm text-pink-500 font-mono">
                                {mood.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-cyan-400 mb-2">
                    Genre
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                      className="w-full bg-black border border-pink-500/50 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    >
                      <span className="text-pink-500">
                        {selectedGenres.length > 0
                          ? `${selectedGenres.length} Genres Selected`
                          : "Select Genre"}
                      </span>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-500" />
                    </button>

                    {genreDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-black border border-pink-500/30 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        <div className="p-3 grid grid-cols-1 gap-2">
                          {genres.map((genre) => (
                            <label
                              key={genre.id}
                              className="flex items-center p-2 hover:bg-pink-500/10 rounded-lg cursor-pointer transition-colors duration-150"
                            >
                              <input
                                type="checkbox"
                                checked={selectedGenres.includes(genre.id)}
                                onChange={() => toggleGenre(genre.id)}
                                className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-pink-500 rounded bg-black"
                              />
                              <span className="ml-2 text-sm text-pink-500 font-mono">
                                {genre.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-cyan-400 mb-2">
                    Device
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDeviceDropdownOpen(!deviceDropdownOpen)}
                      className="w-full bg-black border border-pink-500/50 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    >
                      <span className="text-pink-500">
                        {device
                          ? devices.find((d) => d.id === device)?.name
                          : "Select Device"}
                      </span>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-500" />
                    </button>

                    {deviceDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-black border border-pink-500/30 rounded-xl shadow-lg">
                        <div className="py-1">
                          {devices.map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                setDevice(d.id);
                                setDeviceDropdownOpen(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-pink-500 hover:bg-pink-500/10 text-left transition-colors duration-150 font-mono"
                            >
                              {d.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-cyan-400 mb-2">
                    Play Mode
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setPlayModeDropdownOpen(!playModeDropdownOpen)
                      }
                      className="w-full bg-black border border-pink-500/50 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    >
                      <span className="text-pink-500">
                        {playMode
                          ? playModes.find((p) => p.id === playMode)?.name
                          : "Select Play Mode"}
                      </span>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-500" />
                    </button>

                    {playModeDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-black border border-pink-500/30 rounded-xl shadow-lg">
                        <div className="py-1">
                          {playModes.map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                setPlayMode(mode.id);
                                setPlayModeDropdownOpen(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-pink-500 hover:bg-pink-500/10 text-left transition-colors duration-150 font-mono"
                            >
                              {mode.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    selectedMoods.length === 0 ||
                    !device ||
                    selectedGenres.length === 0 ||
                    !playMode ||
                    loading
                  }
                  className="w-full bg-pink-500/20 text-pink-500 rounded-xl px-4 py-3 hover:bg-pink-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Terminal className="animate-pulse h-5 w-5 mr-2" />
                      Finding Recommendations...
                    </span>
                  ) : (
                    "Find Game Recommendations"
                  )}
                </button>
              </div>
            </form>
          </div>

          {recommendations && (
            <div ref={resultsRef} className="mt-12 max-w-4xl mx-auto">
              <div className="bg-black/80 shadow-2xl shadow-pink-500/20 rounded-2xl border border-pink-500/30 overflow-hidden backdrop-blur-lg">
                <div className="border-b border-pink-500/30 bg-black/50 px-6 py-4">
                  <h3 className="text-xl font-semibold text-pink-500 font-mono neon-glow">
                    Game Recommendations
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.onlineGames.map((game, index) => (
                      <div
                        key={index}
                        className="bg-black/50 border border-pink-500/30 rounded-xl p-4 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-pink-500 font-mono">
                            {game.title}
                          </h5>
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-pink-900/50 text-pink-500 border border-pink-500/30">
                            {game.price === "Free"
                              ? "FREE_ACCESS"
                              : "PREMIUM_ACCESS"}
                          </span>
                        </div>
                        <p className="text-sm text-cyan-400 mb-2 font-mono">
                          {game.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-pink-500 font-mono">
                            {">> "}
                            {game.genre}
                          </span>
                          <div className="flex items-center">
                            {renderStars(parseInt(game.rating))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-cyan-400">
                            <Globe className="h-4 w-4 mr-1" />
                            <span className="font-mono">{game.platform}</span>
                          </div>
                          <a
                            href={game.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-500 rounded-lg text-sm transition-colors duration-200 font-mono"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {game.storeType}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <h4 className="flex items-center text-lg font-semibold text-pink-500 mb-4 font-mono">
                      <UserMinus className="h-5 w-5 mr-2" />
                      {">> OFFLINE_MODULES"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.offlineGames.map((game, index) => (
                        <div
                          key={index}
                          className="bg-black/50 border border-pink-500/30 rounded-xl p-4 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-pink-500 font-mono">
                              {game.title}
                            </h5>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-pink-900/50 text-pink-500 border border-pink-500/30">
                              {game.price === "Free"
                                ? "FREE_ACCESS"
                                : "PREMIUM_ACCESS"}
                            </span>
                          </div>
                          <p className="text-sm text-cyan-400 mb-2 font-mono">
                            {game.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-pink-500 font-mono">
                              {">> "}
                              {game.genre}
                            </span>
                            <div className="flex items-center">
                              {renderStars(parseInt(game.rating))}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-cyan-400">
                            <Laptop className="h-4 w-4 mr-1" />
                            <span className="font-mono">{game.platform}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-xl p-6 mt-8 border border-pink-500/30">
                    <h4 className="flex items-center text-pink-500 font-semibold mb-3 font-mono">
                      <Zap className="h-5 w-5 mr-2" />
                      {">> MOOD_BOOST_PROBABILITY: "}
                      {recommendations.moodBoostPotential}
                    </h4>
                    <div className="space-y-2">
                      {recommendations.recommendations.map((rec, index) => (
                        <p
                          key={index}
                          className="text-sm text-cyan-400 flex items-start font-mono"
                        >
                          <span className="mr-2">{">"}</span>
                          <span>{rec}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/50 border border-pink-500/30 rounded-xl p-6 mt-6">
                    <p className="text-sm text-cyan-400 font-mono">
                      <strong>[SYSTEM_NOTE]::</strong> Recommendations are based
                      on mood matrix input and device compatibility. Ratings and
                      availability may vary based on regional locks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .glitch-text {
          text-shadow: 0 0 10px rgba(236, 72, 153, 0.8),
            0 0 20px rgba(236, 72, 153, 0.8), 0 0 30px rgba(236, 72, 153, 0.8);
          animation: glitch 1s infinite;
        }

        .cyberpunk-scanner {
          position: relative;
          overflow: hidden;
        }

        .cyberpunk-scanner::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(236, 72, 153, 0.8);
          animation: scan 2s linear infinite;
        }

        .cyberpunk-card {
          position: relative;
          overflow: hidden;
        }

        .cyberpunk-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            45deg,
            transparent 45%,
            rgba(236, 72, 153, 0.1) 50%,
            transparent 55%
          );
          animation: cyberpunk-glow 2s linear infinite;
        }

        .cyberpunk-button {
          position: relative;
          overflow: hidden;
        }

        .cyberpunk-button::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(236, 72, 153, 0.1),
            transparent
          );
          animation: cyberpunk-button-glow 2s linear infinite;
        }

        .cyberpunk-input:hover {
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.3);
        }

        .cyberpunk-input:focus {
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        @keyframes cyberpunk-glow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes cyberpunk-button-glow {
          0% {
            transform: rotate(0deg) translate(-100%, -100%);
          }
          100% {
            transform: rotate(360deg) translate(100%, 100%);
          }
        }

        @keyframes neon-pulse {
          0% {
            text-shadow: 0 0 10px rgba(236, 72, 153, 0.8);
          }
          50% {
            text-shadow: 0 0 20px rgba(236, 72, 153, 0.8),
              0 0 30px rgba(236, 72, 153, 0.6);
          }
          100% {
            text-shadow: 0 0 10px rgba(236, 72, 153, 0.8);
          }
        }

        .neon-text {
          animation: neon-pulse 2s infinite;
        }

        .game-card {
          transition: all 0.3s ease;
        }

        .game-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0 25px rgba(236, 72, 153, 0.4);
        }

        .rating-stars {
          filter: drop-shadow(0 0 5px rgba(236, 72, 153, 0.5));
        }

        .cyberpunk-border {
          position: relative;
        }

        .cyberpunk-border::after {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(236, 72, 153, 0.3) 25%,
            rgba(236, 72, 153, 0.6) 50%,
            rgba(236, 72, 153, 0.3) 75%,
            transparent 100%
          );
          z-index: -1;
          animation: border-glow 3s linear infinite;
        }

        @keyframes border-glow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default GameRecommendationApp;
