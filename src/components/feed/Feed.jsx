import { useState, useEffect } from "react";
import axios from "axios";
import PostForm from "../post/PostForm";
import PostsList from "../post/PostsList";
import TokenStorage from "../../utils/TokenStorage";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  const fetchPosts = async () => {
    try {
      const token = TokenStorage.getToken();
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await axios.get(`${API_URL}${API_BASE}/posts`, config);
      const postsData = res.data.map((post) => ({
        ...post,
        like_count: Number(post.like_count),
        reply_count: Number(post.reply_count),
      }));
      setPosts(postsData);
      setError("");
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(
        error.response?.data?.error ||
          "Gagal memuat postingan. Coba lagi nanti."
      );
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [API_URL, API_BASE]);

  return (
    <div>
      <PostForm onPostCreated={fetchPosts} />
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {posts.length === 0 && !error ? (
        <div className="text-gray-500 text-center">Tidak ada postingan.</div>
      ) : (
        <PostsList posts={posts} />
      )}
    </div>
  );
}
