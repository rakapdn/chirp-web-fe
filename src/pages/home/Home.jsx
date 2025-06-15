import { useState, useEffect, useCallback } from "react";
import axios from "axios"; // Ganti dengan `import axios from "./axios"` jika menggunakan interceptor
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";

export default function Home() {
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  
  // Move constants outside useEffect to avoid dependency issues
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
      // Tambahkan timeout dan headers yang lebih lengkap
      const postsRes = await axios.get(`${API_URL}${API_BASE}/posts`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        params: {
          limit: 50, // Batasi jumlah posts untuk performa
          sort: 'createdAt',
          order: 'desc'
        }
      });

      // Validasi response
      if (!postsRes.data || !Array.isArray(postsRes.data)) {
        throw new Error("Format data tidak valid");
      }

      // Proses data dengan error handling yang lebih baik
      const uniqueUsers = [];
      const userIds = new Set();
      const validPosts = postsRes.data.filter(post => 
        post && 
        post.userId && 
        post.author_username &&
        typeof post.createdAt === 'string'
      );

      // Sort berdasarkan tanggal terbaru dengan error handling
      const sortedPosts = validPosts.sort((a, b) => {
        try {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } catch (error) {
          console.warn("Error sorting posts by date:", error);
          return 0;
        }
      });

      // Ambil 5 pengguna unik dengan postingan terbaru
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
      
      // Log untuk debugging (hanya di development)
      if (process.env.NODE_ENV === 'development') {
        console.log("Recent users loaded:", uniqueUsers.length);
      }

    } catch (error) {
      console.error("Error fetching recent users:", error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      } else if (error.response?.status === 403) {
        setErrorMessage("Akses ditolak. Anda tidak memiliki izin untuk melihat data ini.");
      } else if (error.code === 'ECONNABORTED') {
        setErrorMessage("Koneksi timeout. Periksa koneksi internet Anda.");
      } else if (error.response?.status >= 500) {
        setErrorMessage("Server sedang bermasalah. Coba lagi nanti.");
      } else if (!error.response) {
        setErrorMessage("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      } else {
        setErrorMessage(
          error.response?.data?.message || 
          error.response?.data?.error || 
          error.message ||
          "Gagal memuat pengguna terbaru."
        );
      }

      // Fallback data untuk development
      if (process.env.NODE_ENV === 'development') {
        setRecentUsers([
          {
            id: 1,
            username: "john_doe",
            fullName: "John Doe",
            avatar: null,
            lastPostDate: new Date().toISOString(),
            postCount: 5
          },
          {
            id: 2,
            username: "jane_smith",
            fullName: "Jane Smith", 
            avatar: null,
            lastPostDate: new Date(Date.now() - 3600000).toISOString(),
            postCount: 3
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, API_URL, API_BASE]);

  useEffect(() => {
    fetchRecentUsers();
  }, [fetchRecentUsers]);

  const formatLastPostTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Waktu tidak valid";
      
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return "Baru posting";
      } else if (diffInHours < 24) {
        return `${diffInHours}j yang lalu`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}h yang lalu`;
      }
    } catch (error) {
      return "Waktu tidak valid";
    }
  };

  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">
          <Feed /> {/* Menampilkan semua postingan */}
          
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Pengguna Aktif Terbaru
              </h2>
              <button
                onClick={fetchRecentUsers}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Memuat..." : "Refresh"}
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat pengguna terbaru...</span>
              </div>
            ) : errorMessage ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium mb-2">Gagal Memuat Data</p>
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
                <button 
                  onClick={fetchRecentUsers}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Belum ada pengguna dengan postingan</p>
                <p className="text-gray-400 text-sm mt-1">Pengguna yang baru posting akan muncul di sini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 text-center hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => handleUserClick(user.username)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleUserClick(user.username);
                      }
                    }}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.username} avatar`}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-white shadow-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg ${user.avatar ? 'hidden' : 'flex'}`}
                    >
                      {getInitials(user.username)}
                    </div>
                    
                    <p className="text-gray-800 font-semibold text-lg mb-1 truncate" title={user.username}>
                      {user.username}
                    </p>
                    <p className="text-gray-500 text-sm mb-2 truncate" title={user.fullName}>
                      {user.fullName}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mt-3">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatLastPostTime(user.lastPostDate)}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {user.postCount} post
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Rightbar />
      </div>
    </>
  );
}