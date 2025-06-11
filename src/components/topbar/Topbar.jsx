import { useState, useEffect } from "react";
import { Search, Person, Chat, Notifications } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Topbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
          await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Token verification failed:", error.response?.data?.error || error.message);
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-blue-500/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Chirp
              </h1>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:bg-white/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              🏠 Beranda
            </button>
            <button
              onClick={() => navigate("/search")}
              className="px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:bg-white/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              🔍 Cari
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:bg-white/50 relative transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              🔔 Notifikasi
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-2.5 rounded-full font-semibold text-gray-600 hover:bg-white/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              👤 Profil
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
              >
                Login
              </button>
            )}
            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-110">
                U
              </button>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}