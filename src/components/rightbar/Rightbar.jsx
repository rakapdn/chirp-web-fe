import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TokenStorage from "../../utils/TokenStorage";

const USERS_PER_PAGE = 15; // Tentukan berapa user yang tampil per halaman

export default function DiscoverUsers() {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [followLoading, setFollowLoading] = useState(null);
	

	const [currentPage, setCurrentPage] = useState(1);
	const [hasNextPage, setHasNextPage] = useState(true);

	const navigate = useNavigate();
	const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
	const API_BASE = process.env.REACT_APP_API_BASE || "/api";

	// useEffect akan berjalan setiap kali 'currentPage' berubah
	useEffect(() => {
		const fetchUsers = async () => {
			setIsLoading(true);
			setErrorMessage("");
			const token = TokenStorage.getToken();

			if (!token) {
				navigate("/login");
				return;
			}

			try {
				const response = await axios.get(
          `${API_URL}${API_BASE}/users?limit=${USERS_PER_PAGE}&page=${currentPage}`, 
          {
					  headers: { Authorization: `Bearer ${token}` },
				  }
        );
				
				setUsers(response.data);
				if (response.data.length < USERS_PER_PAGE) {
					setHasNextPage(false);
				} else {
					setHasNextPage(true);
				}

			} catch (error) {
				console.error("Error fetching users:", error);
				setErrorMessage("Gagal memuat pengguna.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchUsers();
	}, [currentPage, navigate, API_URL, API_BASE]);

	const handleFollowToggle = async (targetUserId) => {
		setFollowLoading(targetUserId);
		const loggedInUserId = TokenStorage.getUserId();

		if (!loggedInUserId) return;

		try {
			const token = TokenStorage.getToken();
			const response = await axios.post(
				`${API_URL}${API_BASE}/users/${targetUserId}/toggle-follow`,
				{ followerId: loggedInUserId },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			
			const { isFollowing: newIsFollowing } = response.data;
			
			setUsers(currentUsers =>
				currentUsers.map(user =>
					user.id === targetUserId
						? { ...user, isFollowing: newIsFollowing }
						: user
				)
			);
		} catch (error) {
			console.error("Aksi follow/unfollow gagal:", error);
		} finally {
			setFollowLoading(null);
		}
	};
  
	const handleNextPage = () => {
		setCurrentPage(prevPage => prevPage + 1);
	};

	const handlePrevPage = () => {
		setCurrentPage(prevPage => Math.max(1, prevPage - 1));
	};


	if (isLoading) {
		return <div className="text-center p-10">Memuat pengguna...</div>;
	}

	if (errorMessage) {
		return <div className="text-center p-10 text-red-500">{errorMessage}</div>;
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-blue-500/10 border border-white/20">
			<h2 className="text-2xl font-bold text-gray-800 mb-6">Temukan Pengguna Lain</h2>
			
			<ul className="space-y-3">
				{users.map((user) => (
					<li key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
						
						{/* Grup elemen di kiri (Avatar & Nama) */}
						<div 
							className="flex items-center space-x-4 flex-1 cursor-pointer"
							onClick={() => navigate(`/profile/${user.username}`)}
						>
							<div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg">
								{user.username?.charAt(0).toUpperCase() || "U"}
							</div>
							<div>
								<p className="font-semibold text-gray-900">{user.username}</p>
								<p className="text-sm text-gray-600">{user.fullName}</p>
							</div>
						</div>

						{/* Tombol di kanan */}
						<button
							className={`px-4 py-2 text-sm rounded-full font-semibold transition-colors duration-200 ${
								user.isFollowing
									? "bg-gray-200 text-gray-800 hover:bg-gray-300"
									: "bg-blue-500 text-white hover:bg-blue-600"
							}`}
							style={{ minWidth: 95 }}
							onClick={() => handleFollowToggle(user.id)}
							disabled={followLoading === user.id}
						>
							{followLoading === user.id ? "..." : user.isFollowing ? "Diikuti" : "Ikuti"}
						</button>
					</li>
				))}
			</ul>

			{/* Kontrol Paginasi */}
			<div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
				<button 
					onClick={handlePrevPage}
					disabled={currentPage === 1 || isLoading}
					className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Sebelumnya
				</button>
				<span className="text-gray-700 font-medium">Halaman {currentPage}</span>
				<button 
					onClick={handleNextPage}
					disabled={!hasNextPage || isLoading}
					className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Berikutnya
				</button>
			</div>
		</div>
	);
}