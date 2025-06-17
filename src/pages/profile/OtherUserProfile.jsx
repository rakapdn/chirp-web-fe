import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TokenStorage from "../../utils/TokenStorage";
import Post from "../../components/post/Post";

export default function OtherUserProfile() {
	const { username } = useParams();
	const navigate = useNavigate();

	// State disederhanakan untuk kemudahan manajemen
	const [profileData, setProfileData] = useState(null);
	const [posts, setPosts] = useState([]);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [followLoading, setFollowLoading] = useState(false);

	const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
	const API_BASE = process.env.REACT_APP_API_BASE || "/api";

	// Menggabungkan semua logika pengambilan data ke dalam satu useEffect
	useEffect(() => {
		const fetchPageData = async () => {
			setIsLoading(true);
			setErrorMessage("");
			const token = TokenStorage.getToken();

			if (!token) {
				navigate("/login");
				return;
			}

			try {
				// Langkah 1: Ambil data profil LENGKAP berdasarkan username.
				// Endpoint /search Anda sudah mengembalikan semua data yang kita butuhkan
				// (termasuk followerCount dan isFollowing), jadi tidak perlu request tambahan.
				const profileResponse = await axios.get(
					`${API_URL}${API_BASE}/users/search?username=${encodeURIComponent(username)}`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);

				const fullProfile = profileResponse.data;
				const userProfile = fullProfile.user;

				if (!userProfile?.id) {
					throw new Error("Pengguna tidak ditemukan dari respons API.");
				}

				// Set state profil dan status follow dari satu request ini
				setProfileData(fullProfile);
				setIsFollowing(fullProfile.isFollowing);

				// Langkah 2: Setelah userId didapat, ambil postingannya
				const postsResponse = await axios.get(
					`${API_URL}${API_BASE}/users/${userProfile.id}/posts`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setPosts(postsResponse.data);

			} catch (error) {
				console.error("Gagal memuat halaman profil:", error);
				if (error.response?.status === 401) {
					TokenStorage.clear();
					navigate("/login");
				} else if (error.response?.status === 404) {
					setErrorMessage("Pengguna tidak ditemukan.");
				} else {
					setErrorMessage(error.response?.data?.error || "Terjadi kesalahan saat memuat halaman.");
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchPageData();
	}, [username, navigate, API_URL, API_BASE]);

	// Handler follow/unfollow tunggal yang memanggil endpoint toggle
	const handleFollowToggle = async () => {
		// Dapatkan ID dari user yang profilnya sedang dilihat
		const targetUserId = profileData?.user?.id;
		if (!targetUserId || followLoading) return;

		setFollowLoading(true);
		setErrorMessage("");

		// Ambil ID pengguna yang sedang login dari local storage
		const loggedInUserId = TokenStorage.getUserId();
		if (!loggedInUserId) {
			setErrorMessage("Gagal mendapatkan ID Anda. Silakan login ulang.");
			setFollowLoading(false);
			return;
		}

		try {
			const token = TokenStorage.getToken();
			// Panggil endpoint BARU yang sudah kita buat
			const response = await axios.post(
				`${API_URL}${API_BASE}/users/${targetUserId}/toggle-follow`,
				{ followerId: loggedInUserId }, // Kirim ID pengguna login di body
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			// Update state berdasarkan respons dari API (bukan tebakan)
			const { isFollowing: newIsFollowing, newFollowerCount } = response.data;

			setIsFollowing(newIsFollowing);
			setProfileData(prev => ({
				...prev,
				followerCount: newFollowerCount,
			}));

		} catch (error) {
			console.error("Gagal melakukan aksi follow/unfollow:", error);
			setErrorMessage(error.response?.data?.error || "Aksi gagal, coba lagi.");
		} finally {
			setFollowLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-600">Memuat profil untuk @{username}...</p>
			</div>
		);
	}

	if (errorMessage && !profileData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-500">{errorMessage}</p>
			</div>
		);
	}

	return (
		<>
			{/* Header Profil */}
			<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20 p-6 mb-6">
				{errorMessage && profileData && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
						<span className="block sm:inline">{errorMessage}</span>
					</div>
				)}
				<div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
					<div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
						{profileData?.user?.image ? (
							<img src={`${API_URL}${API_BASE}/images/${encodeURIComponent(profileData.user.image)}`} alt={profileData.user.username} className="w-full h-full object-cover" />
						) : (
							profileData?.user?.username?.charAt(0)?.toUpperCase() || "U"
						)}
					</div>
					<div className="flex-1">
						<h1 className="text-2xl font-bold text-gray-800">{profileData?.user?.username || "Unknown"}</h1>
						<p className="text-gray-600">{profileData?.user?.fullName || "Nama Lengkap"}</p>
						<p className="mt-2 text-sm text-gray-500">{profileData?.user?.bio || "Tidak ada bio"}</p>
						<div className="flex justify-center sm:justify-start space-x-6 mt-4 text-gray-500">
							<span><strong>{profileData?.followerCount ?? 0}</strong> Pengikut</span>
							<span><strong>{profileData?.followingCount ?? 0}</strong> Mengikuti</span>
						</div>
					</div>
					<button
						className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${isFollowing ? "bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
						onClick={handleFollowToggle}
						disabled={followLoading}
					>
						{followLoading ? "Memproses..." : isFollowing ? "Diikuti" : "Ikuti"}
					</button>
				</div>
			</div>

			{/* Postingan Pengguna */}
			<div>
				<h3 className="text-xl font-semibold mb-4">Postingan</h3>
				{posts.length > 0 ? (
					<div className="space-y-6">
						{posts.map((post) => (<Post key={post.id} post={post} setPosts={setPosts} />))}
					</div>
				) : (
					<p className="text-gray-500">Pengguna ini belum membuat postingan.</p>
				)}
			</div>
		</>
	);
}