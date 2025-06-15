import { useState, useEffect } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import TokenStorage from "../../utils/TokenStorage"; // sesuaikan path import TokenStorage

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setErrorMessage("");
      const token = TokenStorage.getToken();
      const userId = TokenStorage.getUserId();

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          TokenStorage.clear();
          navigate("/login");
        } else {
          setErrorMessage(error.response?.data?.error || "Gagal memuat profil. Coba lagi nanti.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, API_URL]);

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
                {profileData?.user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{profileData?.user?.username || "Unknown"}</h1>
                <p className="text-gray-600">{profileData?.user?.fullName || "Nama Lengkap"}</p>
                <p className="text-gray-500 text-sm">{profileData?.user?.email || "email@example.com"}</p>
                <p className="mt-2 text-gray-500">{profileData?.user?.bio || "Tidak ada bio"}</p>
                <div className="flex space-x-4 mt-4 text-gray-500">
                  <span>
                    <strong>{profileData?.followerCount ?? 0}</strong> Pengikut
                  </span>
                  <span>
                    <strong>{profileData?.followingCount ?? 0}</strong> Mengikuti
                  </span>
                  <span>
                    <strong>{profileData?.isFollowing ? "Ya" : "Tidak"}</strong> Anda mengikuti
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
