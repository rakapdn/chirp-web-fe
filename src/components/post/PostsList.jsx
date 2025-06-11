import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./Post";

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_URL}${API_BASE}/posts`);
        const postsData = response.data.map(post => ({
          ...post,
          like_count: Number(post.like_count),
          reply_count: Number(post.reply_count),
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchPosts();
  }, [API_URL, API_BASE]);

  return (
    <div className="posts-list space-y-6">
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
