import { useState } from "react";
import { IoClose, IoSend } from "react-icons/io5";
import axios from "axios";
import TokenStorage from "../../utils/TokenStorage";

export default function PostCurrentUser({ post, setPosts }) {
  const [like, setLike] = useState(post.like_count || 0);
  const [isLiked, setIsLiked] = useState(post.liked_by_me || false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  const fetchReplies = async () => {
    setLoading(true);
    const token = TokenStorage.getToken();

    try {
      const response = await axios.get(
        `${API_URL}${API_BASE}/posts/${post.id}/replies`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReplies(response.data);
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentClick = () => {
    setShowCommentForm(!showCommentForm);
    if (!showCommentForm) {
      fetchReplies();
    }
  };

  const likeHandler = async () => {
    const token = TokenStorage.getToken();
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

  const handleComment = async (e) => {
    e.preventDefault();
    const token = TokenStorage.getToken();
    if (!token) {
      alert("Anda harus login untuk mengomentari postingan!");
      return;
    }

    try {
      await axios.post(
        `${API_URL}${API_BASE}/posts/${post.id}/reply`,
        { content: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommentText("");
      setShowCommentForm(false);
      fetchReplies();
    } catch (error) {
      console.error("Comment failed:", error);
      alert(error.response?.data?.error || "Gagal menambahkan komentar!");
    }
  };
  const deleteHandler = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login untuk menghapus postingan!");
      return;
    }

    if (window.confirm("Yakin ingin menghapus postingan ini?")) {
      try {
        await axios.delete(`${API_URL}${API_BASE}/posts/${post.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
      } catch (error) {
        console.error("Delete failed:", error);
        alert(error.response?.data?.error || "Gagal menghapus postingan!");
      }
    }
  };

  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    return `${API_URL}${API_BASE}/images/${encodeURIComponent(filePath)}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-500/5 border border-white/20 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-1 transition-all duration-500 group">
      <div className="flex space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
          {post.author_username?.charAt(0) || "U"}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {post.author_username || "Unknown"}
              </h3>
            </div>
            {/* Tanggal postingan */}
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
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <div className="flex items-center space-x-8 text-gray-500 mt-4">
            <button
              onClick={handleCommentClick}
              className="flex items-center space-x-2 hover:text-blue-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-blue-50"
            >
              <span className="text-lg">💬</span>
              <span className="font-semibold">{post.reply_count}</span>
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
            <button
              onClick={deleteHandler}
              className="hover:text-red-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-red-50"
            >
              <span className="text-lg">🗑️</span>
            </button>
          </div>

          {showCommentForm && (
            <div className="mt-4">
              <form onSubmit={handleComment} className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    // Auto adjust height
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[44px] max-h-[200px]"
                  placeholder="Tulis komentar Anda..."
                  style={{ height: "44px" }}
                  required
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCommentForm(false)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Batal"
                  >
                    <IoClose size={7} />
                  </button>
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    title="Kirim"
                  >
                    <IoSend size={7} />
                  </button>
                </div>
              </form>

              {loading ? (
                <div className="mt-4 text-center text-gray-500">
                  Loading replies...
                </div>
              ) : (
                replies.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            {reply.author_username?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {reply.author_username}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 ml-10">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
