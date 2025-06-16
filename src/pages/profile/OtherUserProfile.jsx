import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TokenStorage from "../../utils/TokenStorage";
import Post from "../../components/post/Post";

export default function OtherUserProfile() {
  const { username } = useParams(); // Ambil username dari URL
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [postsError, setPostsError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  // Fungsi untuk cek status follow
  const checkFollowing = async (userId) => {
    try {
      const token = TokenStorage.getToken();
      const res = await axios.get(
        `${API_URL}${API_BASE}/users/${userId}/is-following`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(res.data.isFollowing);
    } catch {
      setIsFollowing(false);
    }
  };

  // Fungsi untuk fetch data profil
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setErrorMessage("");
      const token = TokenStorage.getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}${API_BASE}/users/search?username=${encodeURIComponent(
            username
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfileData(response.data.user);
        // Cek status follow setelah mendapatkan user
        await checkFollowing(response.data.user.id);
      } catch (error) {
        if (error.response?.status === 401) {
          TokenStorage.clear();
          navigate("/login");
        } else if (error.response?.status === 404) {
          setErrorMessage("Pengguna tidak ditemukan.");
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
  }, [username, navigate, API_URL, API_BASE]);

  // Fungsi untuk fetch postingan pengguna
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      setPostsError("");
      const token = TokenStorage.getToken();

      if (!token) {
        return; // sudah ditangani di fetchProfile
      }

      try {
        const response = await axios.get(
          `${API_URL}${API_BASE}/users/${profileData?.id}/posts`,
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

    if (profileData?.id) {
      fetchPosts();
    }
  }, [profileData?.id, API_URL, API_BASE]);

  // Fungsi untuk handle follow
  const handleFollow = async () => {
    if (!profileData) return;
    setFollowLoading(true);
    try {
      const token = TokenStorage.getToken();
      await axios.post(
        `${API_URL}${API_BASE}/users/${profileData.id}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(true);
      // Update follower count
      setProfileData((prev) => ({
        ...prev,
        followerCount: (prev.followerCount || 0) + 1,
      }));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "Gagal mengikuti pengguna. Coba lagi nanti."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // Fungsi untuk handle unfollow
  const handleUnfollow = async () => {
    if (!profileData) return;
    setFollowLoading(true);
    try {
      const token = TokenStorage.getToken();
      await axios.post(
        `${API_URL}${API_BASE}/users/${profileData.id}/unfollow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(false);
      // Update follower count
      setProfileData((prev) => ({
        ...prev,
        followerCount: Math.max((prev.followerCount || 0) - 1, 0),
      }));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "Gagal berhenti mengikuti pengguna. Coba lagi nanti."
      );
    } finally {
      setFollowLoading(false);
    }
  };

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
      {/* Header Profil */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
            {profileData?.image ? (
              <img
                src={`${API_URL}${API_BASE}/images/${encodeURIComponent(
                  profileData.image
                )}`}
                alt={profileData.username}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              profileData?.username?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {profileData?.username || "Unknown"}
            </h1>
            <p className="text-gray-600">
              {profileData?.fullName || "Nama Lengkap"}
            </p>
            <p className="mt-2 text-gray-500">
              {profileData?.bio || "Tidak ada bio"}
            </p>
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
            className={`px-4 py-2 rounded-lg font-medium ${
              isFollowing
                ? "bg-gray-200 text-gray-700 border border-gray-400"
                : "bg-blue-600 text-white"
            }`}
            onClick={isFollowing ? handleUnfollow : handleFollow}
            disabled={followLoading}
          >
            {followLoading
              ? "Memproses..."
              : isFollowing
              ? "Berhenti Mengikuti"
              : "Ikuti"}
          </button>
        </div>
      </div>
      {/* Postingan Pengguna */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Postingan</h3>
        {isLoadingPosts ? (
          <p className="text-gray-600">Memuat postingan...</p>
        ) : postsError ? (
          <p className="text-red-500">{postsError}</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">Pengguna ini belum membuat postingan.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Post key={post.id} post={post} setPosts={setPosts} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
