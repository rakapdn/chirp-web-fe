import { useState } from "react";
import axios from "axios";

export default function Post({ post }) {
  const [like, setLike] = useState(post.like_count || 0);
  const [isLiked, setIsLiked] = useState(post.liked_by_me || false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  const likeHandler = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login untuk menyukai postingan!");
      return;
    }

    try {
      if (isLiked) {
        await axios.delete(`${API_URL}${API_BASE}/posts/${post.id}/unlike`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLike(like - 1);
      } else {
        await axios.post(`${API_URL}${API_BASE}/posts/${post.id}/like`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLike(like + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Like failed:", error);
      alert(error.response?.data?.error || "Gagal menyukai postingan!");
    }
  };

  // Fungsi untuk menangani URL gambar (mendukung signed URL dari Supabase)
  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    // Asumsi backend mengembalikan file_path, gunakan endpoint /api/images/:filename untuk signed URL
    return `${API_URL}${API_BASE}/images/${encodeURIComponent(filePath)}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-500/5 border border-white/20 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-1 transition-all duration-500 group">
      <div className="flex space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
          {post.author_username?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {post.author_username || "Unknown"}
            </h3>
            <span className="text-gray-500 font-medium">@{post.author_username?.toLowerCase() || "unknown"}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 text-sm">
              {new Date(post.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-gray-800 mb-4 leading-relaxed font-medium">
            {post.content}
          </p>
          {post.image && (
            <img
              className="w-full max-h-96 object-cover rounded-xl"
              src={getImageUrl(post.image)}
              alt="Post image"
              onError={(e) => (e.target.style.display = "none")} // Sembunyikan jika gambar gagal dimuat
            />
          )}
          <div className="flex items-center space-x-8 text-gray-500 mt-4">
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-blue-50">
              <span className="text-lg">💬</span>
              <span className="font-semibold">{post.reply_count || 0}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-green-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-green-50">
              <span className="text-lg">🔄</span>
              <span className="font-semibold">0</span>
            </button>
            <button
              onClick={likeHandler}
              className="flex items-center space-x-2 hover:text-red-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-red-50"
            >
              <span className="text-lg">{isLiked ? "❤️" : "🤍"}</span>
              <span className="font-semibold">{like}</span>
            </button>
            <button className="hover:text-purple-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-purple-50">
              <span className="text-lg">📤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}