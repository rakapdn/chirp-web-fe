import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TokenStorage from "../../utils/TokenStorage";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setSearching] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  const checkFollowing = async (userId) => {
    try {
      const token = TokenStorage.getToken();
      const res = await axios.get(
        `${API_URL}${API_BASE}/users/${userId}/is-following`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(res.data.isFollowing);
      console.log("Is following:", res.data.isFollowing);
    } catch (err) {
      console.error("Error checking follow status:", err.message);
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      const token = TokenStorage.getToken();
      await axios.post(
        `${API_URL}${API_BASE}/users/${user.id}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(true);
      console.log("Follow berhasil untuk user:", user.username);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal mengikuti pengguna.");
      console.error("Error follow:", err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      const token = TokenStorage.getToken();
      await axios.post(
        `${API_URL}${API_BASE}/users/${user.id}/unfollow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(false);
      console.log("Unfollow berhasil untuk user:", user.username);
    } catch (err) {
      setError(
        err.response?.data?.error || "Gagal berhenti mengikuti pengguna."
      );
      console.error("Error unfollow:", err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Masukkan username untuk mencari.");
      return;
    }

    setSearching(true);
    setError("");
    setUser(null);
    setIsFollowing(false);

    const token = TokenStorage.getToken();
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      console.log("Mencari pengguna dengan query:", query);
      const response = await axios.get(
        `${API_URL}${API_BASE}/users/search?username=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Search result:", response.data);
      if (response.data?.user) {
        setUser(response.data.user);
        await checkFollowing(response.data.user.id);
      } else {
        setError("Pengguna tidak ditemukan.");
      }
    } catch (err) {
      console.error("Error searching user:", err);
      if (err.response?.status === 401) {
        TokenStorage.clear();
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Pengguna tidak ditemukan.");
      } else {
        setError(err.response?.data?.error || "Gagal mencari pengguna. Coba lagi.");
      }
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berdasarkan username..."
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Mencari..." : "Cari"}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-2 animate-pulse">{error}</p>}
      {user && (
        <div
          className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-all duration-300"
          onClick={() => {
            console.log("Navigating to profile from search:", user?.username);
            if (user?.username) {
              navigate(`/profile/${user.username}`);
            } else {
              console.error("Username tidak tersedia untuk navigasi");
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              console.log("Navigating to profile from search via keyboard:", user?.username);
              if (user?.username) {
                navigate(`/profile/${user.username}`);
              } else {
                console.error("Username tidak tersedia untuk navigasi via keyboard");
              }
            }
          }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
            {user.image ? (
              <img
                src={`${API_URL}${API_BASE}/images/${encodeURIComponent(user.image)}`}
                alt={user.username || "User"}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = "none";
                  console.warn("Gambar profil gagal dimuat:", user.image);
                }}
              />
            ) : (
              <span>{user.username?.charAt(0).toUpperCase() || "U"}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-medium text-lg">
              {user.username || "Unknown"}
            </p>
            <p className="text-gray-500 text-sm">
              {user.fullName || "Tanpa nama lengkap"}
            </p>
          </div>
          <button
            className={`px-3 py-1 rounded-lg font-medium ${
              isFollowing
                ? "bg-gray-200 text-gray-700 border border-gray-400"
                : "bg-blue-600 text-white"
            }`}
            style={{ minWidth: 90 }}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Follow/Unfollow button clicked for user:", user?.username);
              isFollowing ? handleUnfollow() : handleFollow();
            }}
            disabled={followLoading}
          >
            {followLoading
              ? "Memproses..."
              : isFollowing
              ? "Berhenti Mengikuti"
              : "Ikuti"}
          </button>
        </div>
      )}
    </div>
  );
}