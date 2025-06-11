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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, username, fullName, password } = formData;
    if (!email || !username || !fullName || !password) {
      return "Semua kolom harus diisi.";
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

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);
      const { token } = res.data;
      localStorage.setItem("token", token); // Simpan token
      navigate("/"); // Arahkan ke halaman utama setelah registrasi
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Registrasi gagal! Coba lagi.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden">
        {/* Bagian Kiri - Gambar dan Teks Inspiratif */}
        <div className="w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-10 text-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Chirp - Connect & Share</h2>
          <p className="text-lg mb-6">
            Bergabunglah dengan komunitas kami, bagikan ide Anda, dan temukan koneksi baru!
          </p>
          <p className="text-md">
            Daftar sekarang untuk memulai petualangan sosial Anda dengan Chirp.
          </p>
        </div>

        {/* Bagian Kanan - Form Registrasi */}
        <div className="w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Daftar ke Chirp</h1>
            <p className="text-gray-500 mt-2">Buat akun baru untuk memulai</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan email"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan username"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan password"
                required
                disabled={isLoading}
              />
            </div>
            {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Masuk
              </Link>
            </p>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">© 2025 Chirp</p>
        </div>
      </div>
    </div>
  );
}