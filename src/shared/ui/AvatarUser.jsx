import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "../../features/auth/store/authStore"
import { User, ShoppingBag, CalendarDays, LogOut, Star } from "lucide-react"

export const AvatarUser = () => {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleMenu = () => setOpen((prev) => !prev);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const hasPicture = user?.profilePicture && user.profilePicture.trim() !== "";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleMenu}
                className="w-10 h-10 rounded-full bg-[#E67E22] flex items-center justify-center cursor-pointer hover:bg-[#D35400] transition-colors"
                title={user?.username || "Mi cuenta"}
            >
                {hasPicture ? (
                    <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                    />
                ) : (
                    <span className="text-white font-bold text-sm">
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-[#3A2E2A] border border-[#5a4a44] rounded-xl shadow-xl animate-fadeIn z-50 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#4a3c38] to-[#3A2E2A] border-b border-[#5a4a44]">
                        <div className="w-10 h-10 rounded-full bg-[#E67E22] flex items-center justify-center shrink-0">
                            {hasPicture ? (
                                <img src={user.profilePicture} alt={user.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-sm">
                                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{user?.username}</p>
                            <p className="text-xs text-[#8a7a72] truncate">{user?.email}</p>
                        </div>
                    </div>

                    <ul className="p-2 text-sm font-medium space-y-1">
                        <li>
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 p-2 rounded-lg transition-all text-[#D1D1D1] hover:bg-[#D35400] hover:text-white"
                                onClick={() => setOpen(false)}
                            >
                                <User size={16} className="text-[#3498DB]" />
                                Mi Perfil
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/orders"
                                className="flex items-center gap-2 p-2 rounded-lg transition-all text-[#D1D1D1] hover:bg-[#D35400] hover:text-white"
                                onClick={() => setOpen(false)}
                            >
                                <ShoppingBag size={16} className="text-[#E67E22]" />
                                Mis Pedidos
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/reservations"
                                className="flex items-center gap-2 p-2 rounded-lg transition-all text-[#D1D1D1] hover:bg-[#D35400] hover:text-white"
                                onClick={() => setOpen(false)}
                            >
                                <CalendarDays size={16} className="text-[#27ae60]" />
                                Mis Reservas
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/reviews"
                                className="flex items-center gap-2 p-2 rounded-lg transition-all text-[#D1D1D1] hover:bg-[#D35400] hover:text-white"
                                onClick={() => setOpen(false)}
                            >
                                <Star size={16} className="text-[#f39c12]" />
                                Mis Reseñas
                            </Link>
                        </li>
                        <li className="border-t border-[#5a4a44] mt-1 pt-1">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full text-left p-2 rounded-lg transition-all text-red-500 hover:bg-red-600 hover:text-white"
                            >
                                <LogOut size={16} />
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};
