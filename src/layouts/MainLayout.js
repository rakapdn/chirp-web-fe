import { Outlet } from "react-router-dom";
import Topbar from "../components/topbar/Topbar";
import Sidebar from "../components/sidebar/Sidebar";
import Rightbar from "../components/rightbar/Rightbar";

export default function MainLayout() {
  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto">
        <aside className="sticky top-16 h-[calc(100vh-4rem)]">
          <Sidebar />
        </aside>
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
        <aside className="sticky top-16 h-[calc(100vh-4rem)]">
          <Rightbar />
        </aside>
        
      </div>
    </>
  );
}