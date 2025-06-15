import React from "react";
import Post from "./Post";

export default function PostsList({ posts }) {
  return (
    <div className="posts-list space-y-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
