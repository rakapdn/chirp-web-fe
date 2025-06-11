import { useState, useEffect } from "react";
import axios from "axios"; // Ganti dengan `import axios from "./axios"` jika menggunakan interceptor
import { useNavigate } from "react-router-dom";

export default function Rightbar({ profile }) {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Ambil data pengguna yang login untuk mendapatkan userId
        const userRes = await axios.get(`${API_URL}${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(userRes.data.id);

        // Ambil daftar semua pengguna
        const usersRes = await axios.get(`${API_URL}${API_BASE}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter untuk mengecualikan pengguna yang login
        setUsers(usersRes.data.filter((u) => u.id !== userRes.data.id));
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setErrorMessage(error.response?.data?.error || "Gagal memuat pengguna.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate, API_URL, API_BASE]);

  const HomeRightBar = () => (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-blue-500/10 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-500">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Pengguna Lain</h3>
        {isLoading ? (
          <p className="text-gray-600">Memuat...</p>
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">Tidak ada pengguna lain.</p>
        ) : (
          <ul className="space-y-4">
            {users.slice(0, 5).map((u) => (
              <li
                key={u.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-all duration-300"
                onClick={() => navigate(`/profile/${u.username}`)} // Placeholder rute
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-gray-600 font-medium">{u.username}</span>
                  <p className="text-gray-500 text-sm">{u.fullName}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:block w-72 p-6 sticky top-20 h-screen overflow-y-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/10 border border-white/20">
      {!profile && <HomeRightBar />}
    </aside>
  );
}