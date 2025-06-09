import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      setErrorMessage("");
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
        const API_BASE = process.env.REACT_APP_API_BASE || "/api";
        const res = await axios.get(`${API_URL}${API_BASE}/search?q=${query}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setResults(res.data || []);
      } catch (error) {
        setErrorMessage("Gagal mencari. Coba lagi nanti atau periksa koneksi Anda.");
        // Fallback ke data dummy jika API gagal
        setResults([
          { id: 1, type: "user", username: "Thhor", fullName: "Thor Odinson" },
          { id: 2, type: "post", content: "Halo dunia!", author: { username: "T'Chala" }, createdAt: new Date() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(() => fetchSearchResults(), 500);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleProfileClick = (username) => {
    navigate(`/profile?username=${username}`);
  };

  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Cari</h1>
          <div className="mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari pengguna atau postingan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
          {isLoading ? (
            <div className="text-center text-gray-600">Memuat hasil pencarian...</div>
          ) : errorMessage ? (
            <div className="text-red-500 text-center">{errorMessage}</div>
          ) : results.length === 0 && query.trim() ? (
            <div className="text-center text-gray-500">Tidak ada hasil untuk "{query}".</div>
          ) : (
            <div className="space-y-4">
              {results.map((result) =>
                result.type === "user" ? (
                  <div
                    key={result.id}
                    className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-4"
                    onClick={() => handleProfileClick(result.username)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                      {result.username.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{result.username}</p>
                      <p className="text-gray-500 text-sm">{result.fullName}</p>
                    </div>
                  </div>
                ) : result.type === "post" ? (
                  <div
                    key={result.id}
                    className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <p className="text-gray-800 font-medium">{result.content}</p>
                    <p className="text-gray-500 text-sm">
                      Oleh {result.author?.username} - {new Date(result.createdAt).toLocaleString()}
                    </p>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
        <Rightbar />
      </div>
    </>
  );
}