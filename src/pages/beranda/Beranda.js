import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Feed from "../../components/feed/Feed";

export default function Beranda() {
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  const handleUserClick = useCallback((username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  }, [navigate]);

  const getInitials = useCallback((username) => {
    if (!username) return "U";
    const names = username.split(" ");
    if (names.length > 1) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return username.charAt(0).toUpperCase();
  }, []);

  const fetchRecentUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const postsRes = await axios.get(`${API_URL}${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: 10000,
        params: { limit: 50, sort: 'createdAt', order: 'desc' }
      });
      if (!postsRes.data || !Array.isArray(postsRes.data)) {
        throw new Error("Format data tidak valid");
      }
      const uniqueUsers = [];
      const userIds = new Set();
      const validPosts = postsRes.data.filter(post => 
        post && post.userId && post.author_username && typeof post.createdAt === 'string'
      );
      const sortedPosts = validPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      for (const post of sortedPosts) {
        if (!userIds.has(post.userId) && uniqueUsers.length < 5) {
          userIds.add(post.userId);
          uniqueUsers.push({
            id: post.userId,
            username: post.author_username,
            fullName: post.author_fullName || post.author_username || "Unknown User",
            avatar: post.author_avatar || null,
            lastPostDate: post.createdAt,
            postCount: sortedPosts.filter(p => p.userId === post.userId).length
          });
        }
      }
      setRecentUsers(uniqueUsers);
    } catch (error) {
      console.error("Error fetching recent users:", error);
      setErrorMessage(error.response?.data?.message || "Gagal memuat pengguna terbaru.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, API_URL, API_BASE]);

  useEffect(() => {
    fetchRecentUsers();
  }, [fetchRecentUsers]);

  const formatLastPostTime = (dateString) => {
    // ... (fungsi format waktu Anda)
  };
  return (
    <>
      <Feed />
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Pengguna Aktif Terbaru
          </h2>
          <button onClick={fetchRecentUsers} disabled={isLoading}>
            {isLoading ? "Memuat..." : "Refresh"}
          </button>
        </div>
        
        {/* menampilkan loading, error, atau daftar pengguna */}
        {isLoading ? (
          <div>Loading...</div>
        ) : errorMessage ? (
          <div>Error: {errorMessage}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recentUsers.map((user) => (
              <div key={user.id} onClick={() => handleUserClick(user.username)}>
                <p>{user.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}