import React, { useState, useEffect } from "react";
import axios from "axios";
import TokenStorage from "../../utils/TokenStorage"; // Pastikan path ini sesuai
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Konfigurasi API dari environment atau default localhost
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
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

  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/10 border border-white/20 overflow-hidden">
            <div className="relative">
              <div className="h-40 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm" />
              </div>
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
            </div>
          </div>
        </div>
        <Rightbar profile />
      </div>
    </>
  );
}
