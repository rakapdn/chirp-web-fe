import UserSearch from "./UserSearch"; // pastikan path sudah sesuai

export default function Search() {
  // Ganti React Fragment (<>) dengan sebuah <div> sebagai pembungkus utama
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cari</h1>
      {/* Render komponen UserSearch */}
      <UserSearch />
    </div>
  );
}