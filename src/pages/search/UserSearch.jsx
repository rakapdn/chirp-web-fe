import { useState } from "react";
import axios from "axios";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  // Cek status follow setelah user ditemukan
  const checkFollowing = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      // Endpoint cek status follow (misal /users/:id/is-following)
      const res = await axios.get(
        `${API_URL}${API_BASE}/users/${userId}/is-following`,
        config
      );
      setIsFollowing(res.data.isFollowing);
    } catch {
      setIsFollowing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setUser(null);

    if (!query.trim()) {
      setError("Masukkan username untuk mencari.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await axios.get(
        `${API_URL}${API_BASE}/users/search?username=${encodeURIComponent(query)}`,
        config
      );
      setUser(res.data.user);
      setError("");
      // Cek status follow
      await checkFollowing(res.data.user.id);
    } catch (err) {
      setUser(null);
      setIsFollowing(false);
      if (err.response?.status === 404) {
        setError("Pengguna tidak ditemukan.");
      } else {
        setError(
          err.response?.data?.error ||
            "Gagal mencari pengguna. Coba lagi nanti."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      await axios.post(
        `${API_URL}${API_BASE}/users/${user.id}/follow`,
        {},
        config
      );
      setIsFollowing(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Gagal follow user. Coba lagi nanti."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      await axios.post(
        `${API_URL}${API_BASE}/users/${user.id}/unfollow`,
        {},
        config
      );
      setIsFollowing(false);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Gagal unfollow user. Coba lagi nanti."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="user-search-component">
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari username pengguna..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? "Mencari..." : "Cari"}
        </button>
      </form>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {user && (
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-md flex items-center space-x-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
            {user.image ? (
              <img
                src={user.image}
                alt={user.username}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-medium text-lg">{user.username}</p>
            <p className="text-gray-500 text-sm">{user.fullName || "Tanpa nama lengkap"}</p>
          </div>
          {/* Tombol Follow/Unfollow di sebelah kanan */}
          <button
            className={`px-3 py-1 rounded-lg font-medium ${
              isFollowing
                ? "bg-gray-200 text-gray-700 border border-gray-400"
                : "bg-blue-600 text-white"
            }`}
            style={{ minWidth: 90 }}
            onClick={isFollowing ? handleUnfollow : handleFollow}
            disabled={followLoading}
          >
            {followLoading ? "Memproses..." : isFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      )}
    </div>
  );
}
