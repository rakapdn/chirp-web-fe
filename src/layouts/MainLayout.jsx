import { Outlet } from "react-router-dom";
import Topbar from "../components/topbar/Topbar";
import Sidebar from "../components/sidebar/Sidebar";
import Rightbar from "../components/rightbar/Rightbar";
import BottomNav from "../components/bottomnav/BottomNav"; // Pastikan ini sudah dibuat

export default function MainLayout() {
  return (
    <>
      <Topbar />
      <div className="flex w-full max-w-7xl mx-auto pt-16">
        <aside className="hidden md:block sticky top-16 h-[calc(100vh-4rem)]">
          <Sidebar />
        </aside>

        <main className="flex-1 p-2 md:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

        <aside className="hidden md:block sticky top-16 h-[calc(100vh-4rem)]">
          <Rightbar />
        </aside>

      </div>

      {/* BottomNav untuk Mobile.*/}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </>
  );
}