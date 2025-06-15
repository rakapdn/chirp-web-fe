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
  const [error, setError] = useState("");
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
        // Filter hanya pengguna (type: "user") dan pastikan struktur data sesuai
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
        setResults([]); // Tidak menggunakan data dummy
      }
    };

    const debounce = setTimeout(() => fetchSearchResults(), 500);
    return () => clearTimeout(debounce);
  }, [query, API_URL, API_BASE]);

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
            />
          </div>
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
        <Rightbar />
      </div>
    </>
  );
}