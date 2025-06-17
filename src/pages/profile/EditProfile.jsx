import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TokenStorage from "../../utils/TokenStorage"; // Sesuaikan path jika perlu

export default function EditProfile() {
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(""); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const userId = TokenStorage.getUserId();
  const token = TokenStorage.getToken();

  // ====================================================================
  // PERBAIKAN 1: MENCEGAH MEMORY LEAK DENGAN CLEANUP FUNCTION
  // ====================================================================
  useEffect(() => {
    // AbortController untuk membatalkan request jika komponen unmount
    const controller = new AbortController();
    const signal = controller.signal;

    if (!userId || !token) {
      navigate("/login");
      return;
    }

    const fetchCurrentProfile = async () => {
      // Set isLoading hanya jika kita benar-benar memulai fetch
      setIsLoading(true); 
      try {
        const response = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: signal, // Lewatkan signal ke request axios
        });
        
        const userData = response.data.user;
        setBio(userData.bio || "");
        setImage(userData.image || ""); 
      } catch (err) {
        // Jangan tampilkan error jika request sengaja dibatalkan
        if (err.name !== 'CanceledError') {
           setError("Gagal memuat data profil awal.");
           console.error("Fetch profile error:", err);
        }
      } finally {
        // Pastikan isLoading di set ke false bahkan jika komponen sudah unmount
        // Untuk menghindari error state update, kita bisa cek `signal.aborted`
        if (!signal.aborted) {
            setIsLoading(false);
        }
      }
    };

    fetchCurrentProfile();

    // Ini adalah cleanup function yang akan dijalankan saat komponen unmount
    return () => {
      controller.abort();
    };
  }, [API_URL, userId, token, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    const updateUrl = `${API_URL}/api/users/${userId}/update`;
    const requestBody = { bio, image };

    try {
      await axios.patch(updateUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("Profil berhasil diperbarui!");

      setTimeout(() => {
        navigate("/profile");
      }, 1500);

    // ====================================================================
    // PERBAIKAN 2: PENANGANAN ERROR AGAR TIDAK CRASH
    // ====================================================================
    } catch (err) {
      let displayError = "Terjadi kesalahan saat memperbarui profil.";

      if (err.response && err.response.data && err.response.data.error) {
        const errorData = err.response.data.error;
        
        if (typeof errorData === 'string') {
          displayError = errorData;
        } 
        else if (typeof errorData === 'object' && errorData !== null) {
          const messages = Object.values(errorData)
                                .flatMap(e => e._errors || [])
                                .filter(Boolean);
          if (messages.length > 0) {
            displayError = messages.join('; ');
          } else {
             displayError = "Input tidak valid. Periksa kembali data Anda.";
          }
        }
      }
      
      setError(displayError);
      console.error("Update profile error:", err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !bio) {
    return <div className="p-4 text-center">Memuat data edit...</div>;
  }

  // Tampilan JSX tidak perlu diubah, sudah bagus
  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Profil</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="bio" className="block text-gray-700 font-semibold mb-2">Bio</label>
          <textarea
            id="bio"
            rows="4"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tulis sesuatu tentang dirimu..."
          />
        </div>

        <div className="mb-6">
          <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
            URL Gambar Profil (Opsional)
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="image"
              type="text"
              className="flex-grow w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah"
            />
            <button 
              type="button" 
              onClick={() => setImage('')}
              className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-semibold"
              title="Hapus gambar"
            >
              Hapus
            </button>
          </div>
          
          {image && (
            <div className="mt-3">
              <span className="text-sm text-gray-500 block mb-2">Pratinjau:</span>
              <img 
                src={image} 
                alt="Pratinjau" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }} 
              />
            </div>
          )}
        </div>
        
        {/* Sekarang aman untuk me-render error karena sudah pasti string */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

        <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
        </div>
      </form>
    </div>
  );
}