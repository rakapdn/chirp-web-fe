import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
      const API_BASE = process.env.REACT_APP_API_BASE || "/api";
      const res = await axios.post(`${API_URL}${API_BASE}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Login gagal! Periksa kredensial Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="loginBox bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl shadow-blue-500/10 border border-white/20 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Masuk ke Chirp</h1>
        <div className="space-y-4">
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
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-700">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Daftar
          </a>
        </p>
      </form>
    </div>
  );
}