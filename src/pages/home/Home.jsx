import { useState, useEffect } from "react";
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
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
    const fetchRecentUsers = async () => {
      setIsLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Ambil semua postingan untuk menentukan pengguna terbaru
        const postsRes = await axios.get(`${API_URL}${API_BASE}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ambil daftar unik pengguna berdasarkan postingan terbaru (misalnya, 5 pengguna teratas)
        const uniqueUsers = [];
        const userIds = new Set();
        postsRes.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Urutkan berdasarkan createdAt terbaru
          .forEach((post) => {
            if (!userIds.has(post.userId) && uniqueUsers.length < 5) {
              userIds.add(post.userId);
              uniqueUsers.push({
                id: post.userId,
                username: post.author_username,
                fullName: post.author_fullName || "Unknown", // Asumsi field ini ada di respons
              });
            }
          });

        setRecentUsers(uniqueUsers);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setErrorMessage(error.response?.data?.error || "Gagal memuat pengguna terbaru.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentUsers();
  }, [navigate, API_URL, API_BASE]);

  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <div className="flex-1 p-6">
          <Feed /> {/* Menampilkan semua postingan */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pengguna dengan Postingan Terbaru</h2>
            {isLoading ? (
              <p className="text-gray-600">Memuat...</p>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : recentUsers.length === 0 ? (
              <p className="text-gray-600">Tidak ada pengguna dengan postingan terbaru.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-4 text-center hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 shadow-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-gray-800 font-medium">{user.username}</p>
                    <p className="text-gray-500 text-sm">{user.fullName}</p>
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