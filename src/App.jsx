import React, { useState } from "react";

const AVAILABLE_MOVIES = [
  { title: "Interstellar", genre: "Sci-Fi, Adventure, Physics" },
  { title: "The Martian", genre: "Sci-Fi, Space Exploration, Botany" },
  { title: "Oppenheimer", genre: "Drama, History, Theoretical Physics" },
  { title: "The Imitation Game", genre: "Biography, History, Cryptography" },
  { title: "The Matrix", genre: "Sci-Fi, AI, Simulated Reality" },
  { title: "Ex Machina", genre: "Sci-Fi, AI, Robotics" },
  { title: "The Big Short", genre: "Drama, Wall Street, Finance" },
  { title: "The Wolf of Wall Street", genre: "Biography, Stock Market, Finance" },
  { title: "Contagion", genre: "Thriller, Public Health, Biology" }
];

// Beautiful programmatic book cover gradients based on index
const COVER_GRADIENTS = [
  "from-emerald-950 via-teal-900 to-slate-900",
  "from-violet-950 via-indigo-900 to-slate-900",
  "from-cyan-950 via-blue-900 to-slate-900",
  "from-red-950 via-rose-900 to-slate-900",
  "from-amber-950 via-orange-900 to-slate-900"
];

function App() {
  const [selectedMovies, setSelectedMovies] = useState(["Interstellar", "The Martian"]);
  const [ratings, setRatings] = useState({ Interstellar: 5.0, "The Martian": 4.5 });
  const [useRatings, setUseRatings] = useState(true);
  
  const [activeTab, setActiveTab] = useState("books");
  const [booksRecs, setBooksRecs] = useState([]);
  const [coursesRecs, setCoursesRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Toggle movie selection
  const handleToggleMovie = (title) => {
    if (selectedMovies.includes(title)) {
      setSelectedMovies(selectedMovies.filter(m => m !== title));
      const newRatings = { ...ratings };
      delete newRatings[title];
      setRatings(newRatings);
    } else {
      setSelectedMovies([...selectedMovies, title]);
      setRatings({ ...ratings, [title]: 5.0 }); // Default rating
    }
  };

  // Update movie rating
  const handleRatingChange = (title, val) => {
    setRatings({ ...ratings, [title]: parseFloat(val) });
  };

  // Fetch recommendations from FastAPI backend
  const fetchRecommendations = async () => {
    if (selectedMovies.length === 0) {
      setError("Please select at least one movie.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    const payload = {
      movies: selectedMovies,
      top_k: 4,
      ratings: useRatings ? ratings : null
    };

    try {
      const apiBase = "http://127.0.0.1:8000/api/v1";
      
      // Fetch books
      const bookRes = await fetch(`${apiBase}/recommend/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!bookRes.ok) throw new Error("Failed to fetch books recommendations.");
      const bookData = await bookRes.json();
      setBooksRecs(bookData.books);

      // Fetch courses
      const courseRes = await fetch(`${apiBase}/recommend/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!courseRes.ok) throw new Error("Failed to fetch courses recommendations.");
      const courseData = await courseRes.json();
      setCoursesRecs(courseData.courses);

    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server. Make sure FastAPI is running on http://127.0.0.1:8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] pb-16 font-sans">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-slate-800 bg-[#0a0f1d] px-6 py-10 text-center">
        <div className="absolute top-0 left-1/2 -z-10 h-64 w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[80px]" />
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          <span className="text-gradient">Cross-Domain Recommender</span>
        </h1>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto md:text-base">
          Bridge your entertainment tastes with educational growth. Input your favorite movies, and our Sentence-BERT engine recommends semantic Books & Courses.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Movie Watchlist & Controls */}
        <section className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              🎬 Select Watch History
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select the movies you watched and rate them.
            </p>

            {/* Movie Selector Grid */}
            <div className="mt-4 grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {AVAILABLE_MOVIES.map((movie) => {
                const isSelected = selectedMovies.includes(movie.title);
                return (
                  <button
                    key={movie.title}
                    onClick={() => handleToggleMovie(movie.title)}
                    className={`text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-center ${
                      isSelected
                        ? "bg-violet-950/30 border-violet-500/50 text-violet-200"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{movie.title}</div>
                      <div className="text-[10px] opacity-75">{movie.genre}</div>
                    </div>
                    {isSelected && (
                      <span className="h-5 w-5 rounded-full bg-violet-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Weighted Ratings Selection */}
            {selectedMovies.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Weighted Ratings Mode
                  </label>
                  <input
                    type="checkbox"
                    checked={useRatings}
                    onChange={(e) => setUseRatings(e.target.checked)}
                    className="h-4 w-4 accent-violet-500 cursor-pointer"
                  />
                </div>

                {useRatings && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-slate-500 block">
                      Fine-tune ratings: higher values bias preferences.
                    </span>
                    {selectedMovies.map((movie) => (
                      <div key={movie} className="flex items-center justify-between gap-4 text-xs bg-slate-900/30 p-2 rounded-lg">
                        <span className="text-slate-300 truncate max-w-[120px]">{movie}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="1.0"
                            max="5.0"
                            step="0.5"
                            value={ratings[movie] || 5.0}
                            onChange={(e) => handleRatingChange(movie, e.target.value)}
                            className="w-24 accent-violet-400 cursor-pointer"
                          />
                          <span className="text-violet-300 font-semibold">{ratings[movie] || 5.0}★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendation Action Button */}
            <button
              onClick={fetchRecommendations}
              className="mt-6 w-full py-3 px-4 rounded-xl glow-btn text-white font-semibold text-sm cursor-pointer"
            >
              Generate Recommendations
            </button>
          </div>
        </section>

        {/* Right Panel: Results display */}
        <section className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-950/20 border border-red-500/30 text-red-300 p-4 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          {!hasSearched ? (
            <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="h-16 w-16 rounded-full bg-violet-600/10 flex items-center justify-center text-3xl animate-bounce">
                🛰️
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-200">Awaiting Search Inputs</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-sm">
                Select your movie history on the left side and press "Generate Recommendations" to compute semantic connections.
              </p>
            </div>
          ) : (
            <div>
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-800 gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("books")}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === "books"
                      ? "border-violet-500 text-violet-400 bg-violet-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📚 Recommended Books ({booksRecs.length})
                </button>
                <button
                  onClick={() => setActiveTab("courses")}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === "courses"
                      ? "border-violet-500 text-violet-400 bg-violet-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🎓 Recommended Courses ({coursesRecs.length})
                </button>
              </div>

              {/* Loading State Skeleton */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="glass-panel h-[320px] rounded-2xl animate-pulse p-4 space-y-4">
                      <div className="h-[140px] bg-slate-800 rounded-xl" />
                      <div className="h-6 bg-slate-800 w-3/4 rounded" />
                      <div className="h-4 bg-slate-800 w-1/2 rounded" />
                      <div className="h-10 bg-slate-800 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : activeTab === "books" ? (
                /* BOOKS RESULTS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {booksRecs.map((book, idx) => {
                    const gradient = COVER_GRADIENTS[idx % COVER_GRADIENTS.length];
                    return (
                      <div key={book.title} className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col h-[380px] justify-between">
                        {/* Book Metadata & Cover */}
                        <div className="flex gap-4">
                          {/* CSS Generated cover illustration */}
                          <div className={`h-[130px] w-[90px] rounded shadow-md bg-gradient-to-br ${gradient} flex flex-col justify-between p-2 border-l-4 border-slate-900 shrink-0 select-none`}>
                            <span className="text-[7px] font-bold text-slate-400/80 uppercase tracking-widest text-center mt-1">
                              Science Series
                            </span>
                            <span className="text-[10px] font-serif font-semibold text-slate-100 line-clamp-3 text-center leading-tight">
                              {book.title}
                            </span>
                            <span className="text-[7px] text-slate-300 text-center font-medium italic truncate mb-1">
                              {book.author}
                            </span>
                          </div>

                          <div className="space-y-1 truncate">
                            <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {book.genre.split("|")[0]}
                            </span>
                            <h3 className="text-base font-bold text-slate-100 mt-2 truncate pr-2" title={book.title}>
                              {book.title}
                            </h3>
                            <p className="text-xs text-slate-400">By {book.author}</p>
                            <div className="mt-3 flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400">Match score:</span>
                              <span className="bg-violet-950 text-violet-300 border border-violet-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                                {(book.similarity_score * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 line-clamp-3 mt-4 leading-relaxed italic">
                          "{book.description}"
                        </p>

                        {/* Explanation block */}
                        <div className="bg-violet-950/20 border border-violet-500/15 rounded-xl p-3 mt-4 text-[10px] text-violet-300 flex items-start gap-2">
                          <span className="text-base leading-none">💡</span>
                          <p className="leading-normal">{book.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* COURSES RESULTS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coursesRecs.map((course) => {
                    const isCoursera = course.platform.toLowerCase() === "coursera";
                    const isUdemy = course.platform.toLowerCase() === "udemy";
                    
                    return (
                      <div key={course.course_name} className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col h-[380px] justify-between">
                        <div className="space-y-3">
                          {/* Platform Logo Badge */}
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                              isCoursera
                                ? "bg-blue-950/50 text-blue-400 border-blue-500/30"
                                : isUdemy
                                  ? "bg-purple-950/50 text-purple-400 border-purple-500/30"
                                  : "bg-red-950/50 text-red-400 border-red-500/30"
                            }`}>
                              {course.platform}
                            </span>
                            <span className="bg-violet-950 text-violet-300 border border-violet-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                              Match {(course.similarity_score * 100).toFixed(1)}%
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-100 line-clamp-2" title={course.course_name}>
                            {course.course_name}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                            {course.description}
                          </p>
                        </div>

                        <div>
                          {/* Skill Tags */}
                          <div className="mt-4 flex flex-wrap gap-1">
                            {course.skills.split(",").slice(0, 3).map((skill) => (
                              <span key={skill} className="bg-slate-900 text-slate-400 border border-slate-800 text-[9px] px-2 py-0.5 rounded-md">
                                {skill.strip ? skill.strip() : skill.trim()}
                              </span>
                            ))}
                          </div>

                          {/* Explanation block */}
                          <div className="bg-violet-950/20 border border-violet-500/15 rounded-xl p-3 mt-4 text-[10px] text-violet-300 flex items-start gap-2">
                            <span className="text-base leading-none">💡</span>
                            <p className="leading-normal">{course.explanation}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
