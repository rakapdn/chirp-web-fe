/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan semua file di src dengan ekstensi yang didukung
  ],
  theme: {
    extend: {}, // Anda bisa menambahkan custom theme di sini jika perlu
  },
  plugins: [], // Tambahkan plugin Tailwind tambahan jika diperlukan
}