import { useState, useEffect } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import TokenStorage from "../../utils/TokenStorage"; // sesuaikan path import
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import Post from "../../components/post/PostCurrentUser";

// Fungsi untuk mendapatkan URL gambar dari nama/folder gambar post
const getImageUrl = (imageName) => {
  // Implementasi jika ada logika khusus, misal base url + image path
  return imageName ? `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/uploads/${imageName}` : null;
};

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [postsError, setPostsError] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
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
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate, API_URL]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      setPostsError("");
      const token = TokenStorage.getToken();
      const userId = TokenStorage.getUserId();

      if (!token || !userId) {
        return; // sudah ditangani di fetchProfile
      }

      try {
        const response = await axios.get(`${API_URL}/api/users/${userId}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data); // asumsikan array postingan langsung diterima
      } catch (error) {
        setPostsError(error.response?.data?.error || "Gagal memuat postingan.");
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [API_URL]);

  if (isLoadingProfile) {
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
                    {/* Daftar Postingan User */}
          {/* <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Postingan Anda</h2>

            {isLoadingPosts ? (
              <p className="text-gray-600">Memuat postingan...</p>
            ) : postsError ? (
              <p className="text-red-500">{postsError}</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-600">Belum ada postingan.</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-500/5 border border-white/20 p-6 mb-6 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-1 transition-all duration-500 group"
                >
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      {post.author_username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {post.author_username || "Unknown"}
                        </h3>
                        <span className="text-gray-500 font-medium">@{post.author_username?.toLowerCase() || "unknown"}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(post.createdAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-4 leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
                      {post.image && (
                        <img
                          className="w-full max-h-96 object-cover rounded-xl"
                          src={getImageUrl(post.image)}
                          alt="Post image"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                      <div className="flex items-center space-x-8 text-gray-500 mt-4">
                        <button className="flex items-center space-x-2 hover:text-blue-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-blue-50">
                          <span className="text-lg">💬</span>
                          <span className="font-semibold">{post.reply_count || 0}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-green-50">
                          <span className="text-lg">🔄</span>
                          <span className="font-semibold">0</span>
                        </button>
                        <button
                          // TODO: you can add likeHandler logic per post here
                          className="flex items-center space-x-2 hover:text-red-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-red-50"
                        >
                          <span className="text-lg">🤍</span>
                          <span className="font-semibold">{0}</span>
                        </button>
                        <button
                          // TODO: you can add deleteHandler logic per post here
                          className="hover:text-red-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-red-50"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section> */}
                {/* Postingan User */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Postingan</h3>
        {posts.length === 0 && <p>User belum membuat postingan apapun.</p>}
        {posts.map((post) => (
          <Post key={post.id} post={post} setPosts={setPosts} />
        ))}
      </div>
        </div>
        <Rightbar />
      </div>
    </>
  );
}
