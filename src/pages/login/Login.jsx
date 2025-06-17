import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"; // Import ikon
import TokenStorage from "../../utils/TokenStorage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State baru untuk toggle password
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

      TokenStorage.setToken(token);
      TokenStorage.setUserId(user.id);

      console.log("DEBUG: saved token ->", TokenStorage.getToken());
      console.log("DEBUG: saved userId ->", TokenStorage.getUserId());

      navigate("/");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login gagal! Periksa kredensial Anda.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden">
        {/* Bagian Kiri */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white flex flex-col justify-center text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">Chirp - Connect & Share</h2>
          <p className="text-lg mb-6">
            Terhubung dengan dunia, bagikan ide Anda, dan jadilah bagian dari komunitas yang inspiratif.
          </p>
        </div>

        {/* Bagian Kanan */}
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Masuk ke Chirp</h1>
            <p className="text-gray-500 mt-2">Silakan masukkan detail Anda untuk masuk</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="contoh@email.com"
                required
                disabled={isLoading}
              />
            </div>
            {/* --- BLOK PASSWORD YANG DIPERBARUI --- */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"} // Tipe input dinamis
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="Minimal 6 karakter"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {/* --- AKHIR BLOK PASSWORD --- */}
            
            {errorMessage && <p className="text-red-500 text-sm text-center pt-1">{errorMessage}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Ingat Saya
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Lupa Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:underline">
                Buat Akun
              </Link>
            </p>
            <p className="text-center text-xs text-gray-400 mt-8">
              © {new Date().getFullYear()} Chirp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}