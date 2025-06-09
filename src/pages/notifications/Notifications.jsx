import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
        const API_BASE = process.env.REACT_APP_API_BASE || "/api";
        const res = await axios.get(`${API_URL}${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setNotifications(res.data || []);
      } catch (error) {
        setErrorMessage("Gagal memuat notifikasi. Coba lagi nanti atau periksa koneksi Anda.");
        // Fallback ke data dummy jika API gagal
        setNotifications([
          { id: 1, type: "like", author: { username: "Thhor" }, createdAt: new Date() },
          { id: 2, type: "comment", author: { username: "T'Chala" }, createdAt: new Date() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleProfileClick = (username) => {
    navigate(`/profile?username=${username}`);
  };

  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifikasi</h1>
          {isLoading ? (
            <div className="text-center text-gray-600">Memuat notifikasi...</div>
          ) : errorMessage ? (
            <div className="text-red-500 text-center">{errorMessage}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500">Tidak ada notifikasi baru.</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    {notif.author?.username?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => handleProfileClick(notif.author?.username)}
                      >
                        {notif.author?.username || "Unknown"}
                      </span>{" "}
                      {notif.type === "like" && "menyukai postingan Anda."}
                      {notif.type === "comment" && "mengomentari postingan Anda."}
                      {notif.type === "follow" && "mulai mengikuti Anda."}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Rightbar />
      </div>
    </>
  );
}