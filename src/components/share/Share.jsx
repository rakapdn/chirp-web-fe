import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const res = await axios.get(`${API_URL}${API_BASE}/search?q=${encodeURIComponent(query)}`, config);
        const usersData = Array.isArray(res.data)
          ? res.data
              .filter((item) => item.type === "user")
              .map((item) => ({
                id: item.id,
                type: item.type,
                username: item.username,
                fullName: item.fullName || "Tanpa nama lengkap",
              }))
          : [];
        setResults(usersData);
        setError("");
      } catch (error) {
        console.error("Error fetching search results:", error.response || error);
        setError(
          error.response?.data?.error || "Gagal memuat hasil pencarian. Coba lagi nanti."
        );
        setResults([]);
      }
    };

    const debounce = setTimeout(() => fetchSearchResults(), 500);
    return () => clearTimeout(debounce);
  }, [query, API_URL, API_BASE]);

  const handleProfileClick = (username) => {
    navigate(`/profile?username=${username}`);
  };

  // Handle submitting new post (dummy example, implement API call sesuai backend Anda)
  const handleSubmit = async () => {
    if (!content.trim()) return;
    const formData = new FormData();
    formData.append("content", content);
    if (file) {
      formData.append("file", file);
    }
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axios.post(`${API_URL}${API_BASE}/posts`, formData, config);
      alert("Postingan berhasil dibuat!");
      setContent("");
      setFile(null);
      // Optional: refresh or update something after posting
    } catch (error) {
      console.error("Gagal mengirim postingan:", error.response || error);
      alert("Gagal mengirim postingan. Coba lagi nanti.");
    }
  };

  return (
    <>
      {/* Form postingan di atas hasil pencarian */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 mb-6 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-500">
        <div className="flex space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
            U
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Apa yang sedang Anda pikirkan? ✨"
              className="w-full resize-none border-none outline-none text-lg placeholder-gray-400 bg-transparent font-medium"
              rows="3"
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-3">
                <label className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-110 transition-all duration-300 cursor-pointer">
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                  📷
                </label>
                <button className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-110 transition-all duration-300">
                  📎
                </button>
                <button className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-110 transition-all duration-300">
                  😊
                </button>
              </div>
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                disabled={!content.trim()}
              >
                ✨ Chirp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search input and results below (existing code) */}
      <div>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {results.length === 0 && !error && query.trim() ? (
          <div className="text-gray-500 text-center">Tidak ada hasil untuk "{query}".</div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-4 cursor-pointer"
                onClick={() => handleProfileClick(result.username)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  {result.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{result.username}</p>
                  <p className="text-gray-500 text-sm">{result.fullName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
