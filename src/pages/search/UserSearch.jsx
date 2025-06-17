import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TokenStorage from "../../utils/TokenStorage";

export default function UserSearch() {
	const [query, setQuery] = useState("");
	// Kita simpan seluruh hasil pencarian, bukan hanya 'user'
	const [foundProfile, setFoundProfile] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);
	
	const navigate = useNavigate();
	const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
	const API_BASE = process.env.REACT_APP_API_BASE || "/api";

	const handleSearch = async (e) => {
		e.preventDefault();
		if (!query.trim()) {
			setError("Masukkan username untuk mencari.");
			return;
		}

		setLoading(true);
		setError("");
		setFoundProfile(null);

		const token = TokenStorage.getToken();
		if (!token) {
			navigate("/login");
			return;
		}

		try {
			// Endpoint /search sudah mengembalikan semua data yang kita butuhkan
			// (user, followerCount, isFollowing), jadi tidak perlu API call tambahan.
			const response = await axios.get(
				`${API_URL}${API_BASE}/users/search?username=${encodeURIComponent(query)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			// Simpan semua data yang dikembalikan API
			setFoundProfile(response.data);

		} catch (err) {
			console.error("Error searching user:", err);
			if (err.response?.status === 404) {
				setError("Pengguna tidak ditemukan.");
			} else {
				setError(err.response?.data?.error || "Gagal mencari pengguna.");
			}
		} finally {
			setLoading(false);
		}
	};

	// Menggunakan handler `toggleFollow` yang sama persis seperti di OtherUserProfile
	const handleFollowToggle = async () => {
		const targetUserId = foundProfile?.user?.id;
		if (!targetUserId || followLoading) return;

		setFollowLoading(true);
		setError("");

		const loggedInUserId = TokenStorage.getUserId();
		if (!loggedInUserId) {
			setError("Gagal mendapatkan ID Anda. Silakan login ulang.");
			setFollowLoading(false);
			return;
		}

		try {
			const token = TokenStorage.getToken();
			const response = await axios.post(
				`${API_URL}${API_BASE}/users/${targetUserId}/toggle-follow`,
				{ followerId: loggedInUserId },
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			// Update state berdasarkan respons dari API
			const { isFollowing: newIsFollowing, newFollowerCount } = response.data;

			setFoundProfile(prev => ({
				...prev,
				isFollowing: newIsFollowing,
				followerCount: newFollowerCount,
			}));

		} catch (error) {
			console.error("Gagal melakukan aksi follow/unfollow:", error);
			setError(error.response?.data?.error || "Aksi gagal, coba lagi.");
		} finally {
			setFollowLoading(false);
		}
	};

	// Efek untuk menghilangkan pesan error setelah beberapa detik
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => setError(""), 5000);
			return () => clearTimeout(timer);
		}
	}, [error]);

	// Dapatkan ID pengguna yang login untuk perbandingan
	const loggedInUserId = TokenStorage.getUserId();

	return (
		<div className="bg-white p-4 rounded-lg shadow-md">
			<form onSubmit={handleSearch} className="flex space-x-2 mb-4">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Cari berdasarkan username..."
					className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
					disabled={loading}
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-blue-300"
					disabled={loading}
				>
					{loading ? "Mencari..." : "Cari"}
				</button>
			</form>
			{error && <p className="text-red-500 text-sm mb-2 animate-pulse">{error}</p>}
			{foundProfile && (
				<div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
					<div
						className="flex items-center space-x-4 flex-1 cursor-pointer"
						onClick={() => navigate(`/profile/${foundProfile.user.username}`)}
						role="button" tabIndex={0}
						onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/profile/${foundProfile.user.username}`) }}
					>
						<div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden">
							{foundProfile.user.image ? (
								<img src={`${API_URL}${API_BASE}/images/${encodeURIComponent(foundProfile.user.image)}`} alt={foundProfile.user.username} className="w-full h-full object-cover" />
							) : (
								<span>{foundProfile.user.username?.charAt(0).toUpperCase() || "U"}</span>
							)}
						</div>
						<div className="flex-1">
							<p className="text-gray-800 font-medium text-lg">{foundProfile.user.username}</p>
							<p className="text-gray-500 text-sm">{foundProfile.user.fullName || "Tanpa nama lengkap"}</p>
						</div>
					</div>
					
					{/* Tombol Follow/Unfollow HANYA muncul jika user yang ditemukan BUKAN diri sendiri */}
					{loggedInUserId !== foundProfile.user.id && (
						<button
							className={`px-3 py-1 rounded-lg font-semibold transition-colors duration-200 ${
								foundProfile.isFollowing
									? "bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300"
									: "bg-blue-600 text-white hover:bg-blue-700"
							}`}
							style={{ minWidth: 90 }}
							onClick={(e) => {
								e.stopPropagation(); // Mencegah navigasi saat tombol diklik
								handleFollowToggle();
							}}
							disabled={followLoading}
						>
							{followLoading ? "..." : foundProfile.isFollowing ? "Diikuti" : "Ikuti"}
						</button>
					)}
				</div>
			)}
		</div>
	);
}