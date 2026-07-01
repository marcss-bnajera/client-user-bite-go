import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import imgLogo from "../../assets/img/Bite&GoLogo.png";
import { AvatarUser } from "../../shared/ui/AvatarUser";
import { Menu, X, Search, ShoppingBag, CalendarDays } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { searchProducts } from "../../shared/api";

export const Header = ({ mobileMenuOpen, onToggleMobileMenu }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

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

    const navLinks = isAuthenticated ? [
        { label: "Restaurantes", path: "/restaurants", icon: Search },
        { label: "Mis Pedidos", path: "/orders", icon: ShoppingBag },
        { label: "Mis Reservas", path: "/reservations", icon: CalendarDays },
    ] : [];

    return (
        <nav className="bg-[#F5EFE6] shadow-sm border-b border-[#E8D8C3] sticky top-0 z-50">
            <div className="mx-auto px-3 sm:px-4 md:px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={onToggleMobileMenu}
                        className="p-2 rounded-xl hover:bg-[#E8D8C3] text-[#2B2B2B] transition-colors md:hidden shrink-0"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src={imgLogo}
                            alt="Bite & Go Logo"
                            className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform hover:scale-105 shrink-0"
                        />
                        <div className="h-6 w-[2px] bg-[#E8D8C3] hidden md:block"></div>
                        <h1 className="font-extrabold text-[#2B2B2B] text-lg md:text-xl tracking-tight hidden md:block whitespace-nowrap">
                            Bite <span className="text-[#E67E22]">&amp; Go</span>
                        </h1>
                    </Link>
                </div>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="flex items-center gap-1.5 text-sm font-semibold text-[#6B6B6B] hover:text-[#E67E22] transition-colors"
                        >
                            <link.icon size={16} />
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
                    {/* Search bar */}
                    {isAuthenticated && (
                        <div ref={searchRef} className="relative hidden sm:block">
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
                <div className="flex-1 space-y-4 overflow-y-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={onToggleMobileMenu}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-[#D1D1D1] hover:bg-[#D35400] hover:text-white"
                        >
                            <link.icon size={18} className="shrink-0" />
                            <span className="text-sm">{link.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="mt-4 bg-gradient-to-br from-[#4a3c38] to-[#3A2E2A] rounded-2xl border border-[#5a4a44] p-4">
                    <p className="text-xs text-[#8a7a72]">Bite &amp; Go</p>
                    <p className="text-sm font-bold text-white mt-1">Disfruta la experiencia</p>
                    <p className="text-[10px] text-[#8a7a72] mt-1">v1.0.0</p>
                </div>
            </div>
        </nav>
    );
};
