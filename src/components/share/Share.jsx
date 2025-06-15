import { useState } from "react";
import axios from "axios";

export default function Share({ setPosts }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login untuk membuat postingan!");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    if (file) {
      // Asumsi file diunggah ke /api/images/upload dan mengembalikan URL
      try {
        const uploadRes = await axios.post(
          `${API_URL}${API_BASE}/images/upload`,
          { file, user_id: 1, post_id: 0 }, // Ganti user_id dan post_id dengan nilai dinamis
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        formData.append("image", uploadRes.data.image.file_path);
      } catch (error) {
        console.error("Upload image failed:", error);
        alert("Gagal mengunggah gambar!");
        return;
      }
    }

    try {
      const res = await axios.post(`${API_URL}${API_BASE}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts((prevPosts) => [res.data, ...prevPosts]); // Tambahkan post baru ke daftar
      setContent("");
      setFile(null);
    } catch (error) {
      console.error("Share failed:", error);
      alert(error.response?.data?.error || "Gagal membuat postingan!");
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 mb-6 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-500">
      <div className="flex space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
          U
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Apa yang sedang Anda pikirkan? ✨"
            className="w-full resize-none border-none outline-none text-lg placeholder-gray-400 bg-transparent font-medium"
            rows="3"
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-3">
              <label className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-110 transition-all duration-300 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                📷
              </label>
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-110 transition-all duration-300">
                📎
              </button>
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-110 transition-all duration-300">
                😊
              </button>
            </div>
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
              disabled={!content.trim()}
            >
              ✨ Chirp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}