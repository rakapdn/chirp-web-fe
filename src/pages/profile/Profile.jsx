import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TokenStorage from "../../utils/TokenStorage";
import PostCurrentUser from "../../components/post/PostCurrentUser";

export default function Profile() {
  // State tidak perlu diubah, sudah bagus
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] =useState([]);
  const [isLoading, setIsLoading] = useState(true); // Cukup satu state loading utama
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  // --- PERBAIKAN UTAMA DI SINI ---
  // Menggabungkan kedua useEffect menjadi satu
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const token = TokenStorage.getToken();
      const userId = TokenStorage.getUserId();

      // Pengecekan token dan userId sekali saja
      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        // Gunakan Promise.all untuk menjalankan kedua request API secara paralel
        // Ini lebih cepat daripada menjalankannya satu per satu
        const [profileResponse, postsResponse] = await Promise.all([
          // Request pertama untuk data profil
          axios.get(`${API_URL}/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Request kedua untuk data postingan
          axios.get(`${API_URL}/api/users/${userId}/posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Set state setelah kedua request berhasil
        setProfileData(profileResponse.data);
        setPosts(postsResponse.data);

      } catch (error) {
        console.error("Gagal memuat data profil:", error);
        // Jika token tidak valid (401), hapus dan redirect ke login
        if (error.response?.status === 401) {
          TokenStorage.clear();
          navigate("/login");
        } else {
          // Tampilkan pesan error umum jika salah satu request gagal
          setErrorMessage(
            error.response?.data?.error ||
              "Gagal memuat data. Silakan coba lagi nanti."
          );
        }
      } finally {
        // Hentikan loading setelah semua selesai (baik berhasil maupun gagal)
        setIsLoading(false);
      }
    };

    fetchData();
    // Dependensi navigate ditambahkan karena digunakan di dalam effect
  }, [navigate, API_URL]);


  // Tampilan loading disederhanakan
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 h-screen">
        <p className="text-gray-600 text-lg">Memuat profil...</p>
      </div>
    );
  }

  // Tampilan error juga disederhanakan
  if (errorMessage) {
    return (
      <div className="flex items-center justify-center p-4 h-screen">
        <p className="text-red-500 text-lg">{errorMessage}</p>
      </div>
    );
  }
  
  // Bagian JSX (return) Anda sudah sangat baik dan tidak perlu diubah sama sekali.
  // Kode di bawah ini sama persis dengan yang Anda berikan.
  return (
    <div>
      {/* Header Profil */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
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
            <div className="flex justify-center sm:justify-start space-x-6 mt-4 text-gray-500">
              <span>
                <strong>{profileData?.followerCount ?? 0}</strong> Pengikut
              </span>
              <span>
                <strong>{profileData?.followingCount ?? 0}</strong> Mengikuti
              </span>
            </div>
          </div>
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
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCurrentUser key={post.id} post={post} setPosts={setPosts} />
            ))}
          </div>
        ) : (
          <p>Anda belum membuat postingan apapun.</p>
        )}
      </div>
    </div>
  );
}