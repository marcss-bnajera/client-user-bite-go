import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import imgLogo from "../../assets/img/Bite&GoLogo.png";
import { AvatarUser } from "../../shared/ui/AvatarUser";
import { Menu, X, Search, ShoppingBag, CalendarDays, Star, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { searchProducts } from "../../shared/api";

const navLinks = [
    { label: "Restaurantes", path: "/restaurants", icon: Search },
    { label: "Mis Pedidos", path: "/orders", icon: ShoppingBag },
    { label: "Mis Reservas", path: "/reservations", icon: CalendarDays },
    { label: "Mis Reseñas", path: "/reviews", icon: Star },
    { label: "Mi Perfil", path: "/profile", icon: User },
];

export const Header = ({ mobileMenuOpen, onToggleMobileMenu }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const logout = useAuthStore((s) => s.logout);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchOpen(false);
                setSearchResults([]);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            setSearchLoading(true);
            const { data } = await searchProducts(value);
            setSearchResults(data.products?.slice(0, 5) || []);
        } catch {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        onToggleMobileMenu();
        navigate("/", { replace: true });
    };

    return (
        <nav className="bg-[#F5EFE6] shadow-sm border-b border-[#E8D8C3] sticky top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">

                <div className="flex items-center shrink-0">
                    <button
                        onClick={onToggleMobileMenu}
                        className="p-2 rounded-xl hover:bg-[#E8D8C3] text-[#2B2B2B] transition-colors md:hidden"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link to="/restaurants" className="flex items-center">
                        <img
                            src={imgLogo}
                            alt="Bite & Go"
                            className="h-9 sm:h-10 md:h-11 w-auto object-contain transition-transform hover:scale-105"
                        />
                    </Link>
                </div>

                {isAuthenticated && (
                    <div className="hidden md:flex items-center justify-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path ||
                                (link.path !== "/restaurants" && location.pathname.startsWith(link.path));
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                                        isActive
                                            ? "bg-[#E67E22] text-white"
                                            : "text-[#6B6B6B] hover:bg-[#E8D8C3] hover:text-[#2B2B2B]"
                                    }`}
                                >
                                    <link.icon size={15} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {isAuthenticated && (
                        <div ref={searchRef} className="relative">
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="p-2 rounded-xl hover:bg-[#E8D8C3] text-[#6B6B6B] transition-colors"
                            >
                                <Search size={20} />
                            </button>
                            {searchOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E8D8C3] p-3 animate-fadeIn z-50">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        placeholder="Buscar productos..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                        autoFocus
                                    />
                                    {searchResults.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {searchResults.map((product) => (
                                                <li key={product._id}>
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/restaurants/${product.id_restaurante?._id}`);
                                                            setSearchOpen(false);
                                                            setSearchQuery("");
                                                            setSearchResults([]);
                                                        }}
                                                        className="w-full text-left p-2 rounded-lg hover:bg-[#F5EFE6] text-sm text-[#2B2B2B] transition-colors"
                                                    >
                                                        <span className="font-semibold">{product.nombre}</span>
                                                        <span className="text-[#6B6B6B] ml-2">
                                                            {product.id_restaurante?.nombre}
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {searchLoading && (
                                        <p className="text-xs text-[#6B6B6B] mt-2 text-center">Buscando...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {isAuthenticated ? (
                        <AvatarUser />
                    ) : (
                        <Link
                            to="/auth"
                            className="bg-[#E67E22] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#D35400] transition-colors shadow-md"
                        >
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`
                md:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#3A2E2A] z-50 p-4
                flex flex-col shadow-2xl overflow-hidden
                transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="flex-1 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path ||
                            (link.path !== "/restaurants" && location.pathname.startsWith(link.path));
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={onToggleMobileMenu}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                                    isActive
                                        ? "bg-[#E67E22] text-white"
                                        : "text-[#D1D1D1] hover:bg-[#D35400] hover:text-white"
                                }`}
                            >
                                <link.icon size={18} className="shrink-0" />
                                {link.label}
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-red-600 hover:text-white transition-all"
                    >
                        <LogOut size={18} className="shrink-0" />
                        Cerrar sesión
                    </button>
                </div>
                <div className="mt-4 bg-gradient-to-br from-[#4a3c38] to-[#3A2E2A] rounded-2xl border border-[#5a4a44] p-4">
                    <p className="text-sm font-bold text-white">Disfruta la experiencia</p>
                    <p className="text-[10px] text-[#8a7a72] mt-1">v1.0.0</p>
                </div>
            </div>
        </nav>
    );
};
