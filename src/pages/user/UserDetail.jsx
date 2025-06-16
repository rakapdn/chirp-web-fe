import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";

const getImageUrl = (imageName) => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";
  return imageName ? `${API_URL}${API_BASE}/images/${encodeURIComponent(imageName)}` : null;
};

export default function UserDetail() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:3000"}${
            process.env.REACT_APP_API_BASE || "/api"
          }/users/search?username=${encodeURIComponent(username)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(response.data.user || null);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setErrorMessage(error.response?.data?.error || "Gagal memuat data pengguna.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      if (!userData?.id) return;
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:3000"}${
            process.env.REACT_APP_API_BASE || "/api"
          }/users/${userData.id}/posts`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setPosts(response.data);
      } catch (error) {
        console.error("Gagal memuat postingan:", error);
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, [navigate, username, userData?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Memuat data pengguna...</p>
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

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Pengguna tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {userData.image ? (
                  <img
                    src={getImageUrl(userData.image)}
                    alt={`${userData.username} avatar`}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  userData.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{userData.username}</h1>
                <p className="text-gray-600">{userData.fullName || "Tanpa nama lengkap"}</p>
                <p className="mt-2 text-gray-500">{userData.bio || "Tidak ada bio"}</p>
                <div className="flex space-x-4 mt-4 text-gray-500">
                  <span>
                    <strong>{userData.followerCount ?? 0}</strong> Pengikut
                  </span>
                  <span>
                    <strong>{userData.followingCount ?? 0}</strong> Mengikuti
                  </span>
                </div>
              </div>
              {userData.id !== localStorage.getItem("userId") && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => alert("Fitur follow belum diimplementasikan di sini")}
                >
                  Follow
                </button>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Postingan</h3>
            {posts.length === 0 ? (
              <p>User ini belum membuat postingan apapun.</p>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <post key={post.id} post={post} setPosts={setPosts} />
                ))}
              </div>
            )}
          </div>
        </div>
        <Rightbar profile={userData} />
      </div>
    </>
  );
}