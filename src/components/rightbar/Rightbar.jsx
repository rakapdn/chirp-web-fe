import { useState, useEffect } from "react";
import axios from "axios";

export default function Rightbar({ profile }) {
  const [users, setUsers] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_BASE || "/api";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}${API_BASE}/users`);
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [API_URL, API_BASE]);

  const HomeRightBar = () => (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-blue-500/10 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-500">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Online Friends</h3>
        <ul className="space-y-4">
          {users.slice(0, 5).map((u) => (
            <li key={u.id} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                {u.username.charAt(0)}
              </div>
              <span className="text-gray-600">{u.username}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:block w-72 p-6 sticky top-20 h-screen overflow-y-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/10 border border-white/20">
      {!profile && <HomeRightBar />}
    </aside>
  );
}