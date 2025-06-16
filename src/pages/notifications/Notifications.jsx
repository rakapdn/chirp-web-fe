import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Redirect ke login jika tidak ada token
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const API_URL =
          process.env.REACT_APP_API_URL || "http://localhost:3000";
        const API_BASE = process.env.REACT_APP_API_BASE || "/api";

        const res = await axios.get(`${API_URL}${API_BASE}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 detik timeout
        });

        // Validasi response data
        if (res.data && Array.isArray(res.data)) {
          setNotifications(res.data);
        } else if (res.data && Array.isArray(res.data.notifications)) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);

        if (error.response?.status === 401) {
          // Token tidak valid, redirect ke login
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (error.response?.status === 403) {
          setErrorMessage(
            "Akses ditolak. Anda tidak memiliki izin untuk melihat notifikasi."
          );
        } else if (error.code === "ECONNABORTED") {
          setErrorMessage("Koneksi timeout. Periksa koneksi internet Anda.");
        } else if (error.response?.status >= 500) {
          setErrorMessage("Server sedang bermasalah. Coba lagi nanti.");
        } else if (!error.response) {
          setErrorMessage(
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
          );
        } else {
          setErrorMessage("Gagal memuat notifikasi. Coba lagi nanti.");
        }

        // Fallback ke data dummy hanya dalam development
        if (process.env.NODE_ENV === "development") {
          setNotifications([
            {
              id: 1,
              type: "like",
              author: { username: "Thhor" },
              createdAt: new Date().toISOString(),
              message: "menyukai postingan Anda",
            },
            {
              id: 2,
              type: "comment",
              author: { username: "T'Chala" },
              createdAt: new Date().toISOString(),
              message: "mengomentari postingan Anda",
            },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const handleProfileClick = (username) => {
    if (username) {
      navigate(`/profile/${username}`); 
    }
  };

  const getNotificationMessage = (type) => {
    switch (type) {
      case "like":
        return "menyukai postingan Anda.";
      case "comment":
        return "mengomentari postingan Anda.";
      case "follow":
        return "mulai mengikuti Anda.";
      default:
        return "berinteraksi dengan Anda.";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Waktu tidak valid";
      }

      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return diffInMinutes <= 1
          ? "Baru saja"
          : `${diffInMinutes} menit yang lalu`;
      } else if (diffInHours < 24) {
        return `${diffInHours} jam yang lalu`;
      } else {
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch (error) {
      return "Waktu tidak valid";
    }
  };

  const getInitials = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifikasi</h1>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat notifikasi...</span>
        </div>
      ) : errorMessage ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-medium mb-2">Terjadi Kesalahan</p>
          <p className="text-red-500 text-sm">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 8h6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">Tidak ada notifikasi baru.</p>
          <p className="text-gray-400 text-sm mt-1">
            Notifikasi akan muncul ketika ada aktivitas baru.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-4 hover:bg-white/95"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {getInitials(notif.author?.username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium">
                  <span
                    className="text-blue-600 hover:underline cursor-pointer font-semibold"
                    onClick={() => handleProfileClick(notif.author?.username)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleProfileClick(notif.author?.username);
                      }
                    }}
                  >
                    {notif.author?.username || "Pengguna"}
                  </span>{" "}
                  {notif.message || getNotificationMessage(notif.type)}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {formatDate(notif.createdAt)}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-3 h-3 bg-blue-600 rounded-full shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
