import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import OtherUserProfile from "./pages/profile/OtherUserProfile"; // Import baru
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Notifications from "./pages/notifications/Notifications";
import Search from "./pages/search/Search";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Placeholder untuk halaman profil pengguna lain
// const OtherUserProfile = () => (
//   <div className="min-h-screen flex items-center justify-center">
//     <p className="text-gray-600">Fitur profil pengguna lain belum diimplementasikan.</p>
//   </div>
// );

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<OtherUserProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;