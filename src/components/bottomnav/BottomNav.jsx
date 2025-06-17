import { NavLink } from "react-router-dom";
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserIcon 
} from "@heroicons/react/24/solid";

export default function BottomNav() {
  const navLinks = [
    { to: "/", icon: HomeIcon, label: "Beranda" },
    { to: "/search", icon: MagnifyingGlassIcon, label: "Cari" },
    { to: "/notifications", icon: BellIcon, label: "Notifikasi" },
    { to: "/profile", icon: UserIcon, label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t z-40">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`
            }
          >
            <link.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}