import { useState, useEffect } from "react";
import axios from "axios"; // Ganti dengan `import axios from "./axios"` jika menggunakan interceptor
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Ambil data pengguna
        const userRes = await axios.get(`${API_URL}${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setErrorMessage(error.response?.data?.error || "Gagal memuat profil. Coba lagi nanti.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, API_URL, API_BASE]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Memuat profil...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <div className="flex-1 p-6">
          {/* Header Profil */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{user?.username || "Unknown"}</h1>
                <p className="text-gray-600">{user?.fullName || "Nama Lengkap"}</p>
                <p className="text-gray-500 text-sm">{user?.email || "email@example.com"}</p>
                <div className="flex space-x-4 mt-2 text-gray-500">
                  <span>
                    <strong>0</strong> Pengikut
                  </span>
                  <span>
                    <strong>0</strong> Mengikuti
                  </span>
                </div>
              </div>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => alert("Fitur edit profil belum diimplementasikan")}
              >
                Edit Profil
              </button>
            </div>
          </div>
        </div>
        <Rightbar />
      </div>
    </>
  );
}