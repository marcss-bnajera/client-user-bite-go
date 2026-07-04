import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, CalendarDays, Star, User, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAuthStore } from "../../features/auth/store/authStore";

const links = [
    { label: "Restaurantes", path: "/restaurants", icon: Search },
    { label: "Mis Pedidos", path: "/orders", icon: ShoppingBag },
    { label: "Mis Reservas", path: "/reservations", icon: CalendarDays },
    { label: "Mis Reseñas", path: "/reviews", icon: Star },
    { label: "Mi Perfil", path: "/profile", icon: User },
];

export const Sidebar = ({ collapsed, onToggle }) => {
    const location = useLocation();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const avatarSrc = user?.profilePicture && user.profilePicture.trim() !== ""
        ? user.profilePicture : null;

    return (
        <aside className={`hidden md:flex flex-col bg-[#3A2E2A] min-h-screen sticky top-0 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "w-[68px]" : "w-64"}`}>
            <div className={`flex items-center border-b border-[#5a4a44] ${collapsed ? "justify-center p-3" : "justify-between p-5"}`}>
                {!collapsed && (
                    <p className="text-xs text-[#8a7a72]">Panel del cliente</p>
                )}
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-lg hover:bg-[#5a4a44] text-[#8a7a72] hover:text-white transition-colors"
                    title={collapsed ? "Expandir" : "Colapsar"}
                >
                    {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                </button>
            </div>

            <div className={`flex items-center border-b border-[#5a4a44] ${collapsed ? "justify-center py-4 px-2" : "gap-3 px-5 py-4"}`}>
                <div className="w-10 h-10 rounded-full bg-[#5a4a44] flex items-center justify-center overflow-hidden shrink-0">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt={user?.username} className="w-full h-full object-cover" />
                    ) : (
                        <User size={20} className="text-[#E67E22]" />
                    )}
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{user?.username}</p>
                        <p className="text-xs text-[#8a7a72] truncate">{user?.role}</p>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-2 space-y-1">
                {links.map((link) => {
                    const isActive = location.pathname === link.path ||
                        (link.path !== "/restaurants" && location.pathname.startsWith(link.path));
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            title={collapsed ? link.label : undefined}
                            className={`flex items-center gap-3 rounded-xl text-sm font-semibold transition-all ${
                                collapsed ? "justify-center px-2 py-3" : "px-4 py-3"
                            } ${
                                isActive
                                    ? "bg-[#E67E22] text-white"
                                    : "text-[#D1D1D1] hover:bg-[#D35400] hover:text-white"
                            }`}
                        >
                            <link.icon size={18} className="shrink-0" />
                            {!collapsed && link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className={`p-2 border-t border-[#5a4a44] ${collapsed ? "flex justify-center" : ""}`}>
                <button
                    onClick={handleLogout}
                    title={collapsed ? "Cerrar sesión" : undefined}
                    className={`flex items-center gap-3 w-full rounded-xl text-sm font-semibold text-red-400 hover:bg-red-600 hover:text-white transition-all ${
                        collapsed ? "justify-center px-2 py-3" : "px-4 py-3"
                    }`}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!collapsed && "Cerrar sesión"}
                </button>
            </div>
        </aside>
    );
};
