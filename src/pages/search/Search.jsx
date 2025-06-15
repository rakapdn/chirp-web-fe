import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import UserSearch from "./UserSearch"; // pastikan path sudah sesuai

export default function Search() {
  return (
    <>
      <Topbar />
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Cari</h1>
          {/* Render komponen UserSearch */}
          <UserSearch />
        </div>
        <Rightbar />
      </div>
    </>
  );
}
