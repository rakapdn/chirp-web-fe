import { useState, useEffect } from "react";
import axios from "axios";
import Share from "../share/Share";
import Post from "../post/Post";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const res = await axios.get(`${API_URL}${API_BASE}/posts`, config);
        setPosts(res.data);
        setError("");
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(
          error.response?.data?.error || "Gagal memuat postingan. Coba lagi nanti."
        );
      }
    };
    fetchPosts();
  }, [API_URL, API_BASE]);

  return (
    <main className="flex-1 min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <Share setPosts={setPosts} /> {/* Pass setPosts untuk penyegaran */}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {posts.length === 0 && !error ? (
        <div className="text-gray-500 text-center">Tidak ada postingan.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Post key={p.id} post={p} />
          ))}
        </div>
      )}
    </main>
  );
}