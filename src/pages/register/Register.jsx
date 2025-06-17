import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, username, fullName, password } = formData;
    if (!email || !username || !fullName || !password) {
      return "Semua kolom wajib diisi.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Format email tidak valid.";
    }
    if (username.length < 3) {
      return "Username harus minimal 3 karakter.";
    }
    if (password.length < 6) {
      return "Password harus minimal 6 karakter.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
      await axios.post(`${API_URL}/api/auth/register`, formData);

      setSuccessMessage("Registrasi berhasil! Anda akan diarahkan ke halaman login...");

      // Arahkan ke halaman login setelah 2 detik
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      const errorMsg = error.response?.data?.error || "Registrasi gagal! Username atau email mungkin sudah digunakan.";
      setErrorMessage(errorMsg);
      setIsLoading(false); // Set isLoading false hanya jika terjadi error
    } 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden">
        {/* Bagian Kiri */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white flex flex-col justify-center text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">Chirp - Connect & Share</h2>
          <p className="text-lg mb-6">
            Bergabunglah dengan komunitas kami, bagikan ide Anda, dan temukan koneksi baru!
          </p>
        </div>

        {/* Bagian Kanan */}
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Daftar ke Chirp</h1>
            <p className="text-gray-500 mt-2">Buat akun baru untuk memulai</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (semua input form tetap sama) ... */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="contoh@email.com" required disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Pilih username unik" required disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan nama lengkap Anda" required disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="text" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Buat password minimal 6 karakter" required disabled={isLoading} />
            </div>
            
            {/* Tampilkan pesan sukses atau error */}
            {errorMessage && <p className="text-red-500 text-sm text-center pt-1">{errorMessage}</p>}
            {successMessage && <p className="text-green-600 font-semibold text-sm text-center pt-1">{successMessage}</p>}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Buat Akun"}
            </button>
          </form>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}