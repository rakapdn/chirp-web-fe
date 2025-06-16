import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Import Halaman
import Beranda from "./pages/beranda/Beranda";
import Profile from "./pages/profile/Profile";
import OtherUserProfile from "./pages/profile/OtherUserProfile";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Notifications from "./pages/notifications/Notifications";
import Search from "./pages/search/Search";

// Import Layout
import MainLayout from "./layouts/MainLayout";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute publik di luar layout utama */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Semua rute di bawah ini akan dicek tokennya terlebih dahulu */}
        <Route element={<ProtectedRoute />}>
          {/* Semua rute di bawah ini akan menggunakan MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Beranda />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<OtherUserProfile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;