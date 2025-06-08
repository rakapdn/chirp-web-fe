import Share from "../share/Share";
import Post from "../post/Post";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}${API_BASE}/posts`);
        setPosts(res.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [API_URL, API_BASE]);

  return (
    <main className="flex-1 min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <Share />
      <div className="space-y-4">
        {posts.map((p) => (
          <Post key={p.id} post={p} />
        ))}
      </div>
    </main>
  );
}