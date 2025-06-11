<<<<<<< HEAD
import { useState, useEffect } from "react";
import axios from "axios"; // Ganti dengan `import axios from "./axios"` jika menggunakan interceptor
import { useNavigate } from "react-router-dom";
=======
import React, { useState, useEffect } from "react";
import axios from "axios";
import TokenStorage from "../../utils/TokenStorage"; // Pastikan path ini sesuai
>>>>>>> 676164c3e260cef07076e7fa5a473fbe4dbec415
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";

export default function Profile() {
<<<<<<< HEAD
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
=======
  const [userProfile, setUserProfile] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Konfigurasi API dari environment atau default localhost
>>>>>>> 676164c3e260cef07076e7fa5a473fbe4dbec415
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
<<<<<<< HEAD
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
=======
    const fetchUserProfile = async () => {
      try {
        const token = TokenStorage.getToken();
        if (!token) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        const userId = TokenStorage.getUserId();
        if (!userId) {
          setError("User ID not found in token.");
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Panggil endpoint dengan user id dari token
        const response = await axios.get(`${API_URL}${API_BASE}/users/${userId}`, config);

        if (response.data) {
          // Response sesuai JSON yang diberikan
          const { user, followerCount, followingCount, isFollowing } = response.data;
          setUserProfile(user);
          setFollowerCount(followerCount);
          setFollowingCount(followingCount);
          setIsFollowing(isFollowing);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile.");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [API_URL, API_BASE]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (!userProfile) return <div>No profile data available.</div>;
>>>>>>> 676164c3e260cef07076e7fa5a473fbe4dbec415

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
<<<<<<< HEAD
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
=======
              <div className="absolute -bottom-16 left-6">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl">
                  {userProfile.image ? (
                    <img
                      src={userProfile.image}
                      alt={`${userProfile.username} profile`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-20 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">{userProfile.fullName || userProfile.username}</h1>
                  <p className="text-gray-600 font-medium text-lg">@{userProfile.username}</p>
                </div>
                <button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
                  // TODO: Tambahkan handler untuk edit profile jika ada
                >
                  ✏️ Edit Profil
                </button>
              </div>
              <p className="text-gray-800 mb-6 text-lg leading-relaxed font-medium">
                {userProfile.bio || "Belum ada bio."}
              </p>
              <div className="flex space-x-8 mb-8">
                <div className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {followingCount}
                  </div>
                  <div className="text-gray-600 font-medium group-hover:text-blue-500 transition-colors">
                    Mengikuti
                  </div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                    {followerCount}
                  </div>
                  <div className="text-gray-600 font-medium group-hover:text-purple-500 transition-colors">
                    Pengikut
                  </div>
                </div>
              </div>
              <Feed />
>>>>>>> 676164c3e260cef07076e7fa5a473fbe4dbec415
            </div>
          </div>
        </div>
        <Rightbar />
      </div>
    </>
  );
}
