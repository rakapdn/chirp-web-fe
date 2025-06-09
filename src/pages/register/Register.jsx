import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
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
      await axios.post(`${API_URL}${API_BASE}/auth/register`, {
        email,
        username,
        fullName,
        password,
      });
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Registrasi gagal! Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="registerBox bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl shadow-blue-500/10 border border-white/20 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Daftar ke Chirp</h1>
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
            {isLoading ? "Memproses..." : "Daftar"}
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-700">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Masuk
          </a>
        </p>
      </form>
    </div>
  );
}