import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TokenStorage from "../../utils/TokenStorage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      return "Email dan password harus diisi.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Format email tidak valid.";
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
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, user } = res.data;

      // Simpan token dan userId menggunakan TokenStorage
      TokenStorage.setToken(token);
      TokenStorage.setUserId(user.id);

      // Verifikasi penyimpanan (opsional debug)
      console.log("DEBUG: saved token ->", TokenStorage.getToken());
      console.log("DEBUG: saved userId ->", TokenStorage.getUserId());

      navigate("/"); // Arahkan ke halaman utama setelah login
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login gagal! Periksa kredensial Anda.";
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
            Terhubung dengan dunia, bagikan ide Anda, dan jadilah bagian dari komunitas yang inspiratif.
          </p>
          <p className="text-md">
            Tingkatkan koneksi Anda dengan mudah dan nikmati pengalaman sosial yang lebih baik.
          </p>
        </div>

        {/* Bagian Kanan - Form Login */}
        <div className="w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Masuk ke Chirp</h1>
            <p className="text-gray-500 mt-2">Silakan masukkan detail Anda untuk masuk</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan password"
                required
                disabled={isLoading}
              />
            </div>
            {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                  Ingat Saya
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Lupa Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Buat Akun
              </Link>
            </p>
            <p className="text-center text-xs text-gray-400 mt-6">© 2025 Chirp</p>
          </div>
        </div>
      </div>
    </div>
  );
}