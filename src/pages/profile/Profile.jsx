import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TokenStorage from "../../utils/TokenStorage";
import PostCurrentUser from "../../components/post/PostCurrentUser";

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
          setErrorMessage(
            error.response?.data?.error ||
              "Gagal memuat profil. Coba lagi nanti."
          );
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
        return; 
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/users/${userId}/posts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPosts(response.data); 
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
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-600">Memuat profil...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Profil */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
          
          {/* Avatar dibuat sedikit lebih kecil di mobile */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {profileData?.user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {profileData?.user?.username || "Unknown"}
            </h1>
            <p className="text-gray-600">
              {profileData?.user?.fullName || "Nama Lengkap"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {profileData?.user?.bio || "Tidak ada bio"}
            </p>
            
            {/* Statistik dibuat berpusat di mobile */}
            <div className="flex justify-center sm:justify-start space-x-6 mt-4 text-gray-500">
              <span>
                <strong>{profileData?.followerCount ?? 0}</strong> Pengikut
              </span>
              <span>
                <strong>{profileData?.followingCount ?? 0}</strong> Mengikuti
              </span>
            </div>
          </div>
          
          {/* Tombol dibuat lebar penuh di mobile agar mudah disentuh */}
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => alert("Fitur edit profil belum diimplementasikan")}
          >
            Edit Profil
          </button>
        </div>
      </div>

      {/* Postingan User */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Postingan</h3>
        {isLoadingPosts && <p>Memuat postingan...</p>}
        {postsError && <p className="text-red-500">{postsError}</p>}
        {!isLoadingPosts && posts.length === 0 && (
          <p>Anda belum membuat postingan apapun.</p>
        )}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCurrentUser key={post.id} post={post} setPosts={setPosts} />
          ))}
        </div>
      </div>
    </div>
  );
}