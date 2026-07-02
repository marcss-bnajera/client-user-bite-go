import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "../../../shared/api";
import { Search, MapPin } from "lucide-react";

export const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                const params = { page, limit: 12 };
            if (search) params.search = search;
                const { data } = await getRestaurants(params);
                if (!cancelled) {
                    setRestaurants(data.restaurants || []);
                    setTotalPages(data.totalPages || 1);
                }
            } catch (err) {
                console.error("Error al cargar restaurantes", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchRestaurants();
        return () => { cancelled = true; };
    }, [page, refreshKey, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setRefreshKey((k) => k + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#2B2B2B] to-[#3A2E2A] text-white py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
                        Encuentra tu restaurante favorito
                    </h1>
                    <p className="text-white/70 text-lg mb-6">
                        Explora, ordena y disfruta desde donde estés
                    </p>
                    <form onSubmit={handleSearch} className="flex max-w-xl mx-auto">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar restaurantes..."
                                className="w-full pl-10 pr-4 py-3 rounded-l-xl text-gray-900 text-sm bg-white focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#E67E22] hover:bg-[#D35400] text-white px-6 py-3 rounded-r-xl font-semibold text-sm transition-colors"
                        >
                            Buscar
                        </button>
                    </form>
                </div>
            </div>

            {/* Restaurant grid */}
            <div className="max-w-6xl mx-auto px-4 py-8 pb-12">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-[#E8D8C3] overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : restaurants.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No se encontraron restaurantes</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <Link
                                key={restaurant._id}
                                to={`/restaurants/${restaurant._id}`}
                                className="bg-white rounded-2xl shadow-sm border border-[#E8D8C3] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="h-48 bg-gradient-to-br from-[#F5EFE6] to-[#E8D8C3] flex items-center justify-center">
                                    {restaurant.fotos_url?.[0] ? (
                                        <img
                                            src={restaurant.fotos_url[0]}
                                            alt={restaurant.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl">🍽️</span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-[#2B2B2B] text-lg">{restaurant.nombre}</h3>
                                    <div className="flex items-center gap-1 text-sm text-[#6B6B6B] mt-1">
                                        <MapPin size={14} />
                                        <span className="truncate">{restaurant.direccion?.texto}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs font-semibold text-[#E67E22] bg-[#F5EFE6] px-2 py-1 rounded-full">
                                            {restaurant.categoria_gastronomica}
                                        </span>
                                        <span className="text-sm font-bold text-[#2B2B2B]">
                                            Q{restaurant.precio_promedio}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E8D8C3] disabled:opacity-40 hover:bg-[#F5EFE6] transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold text-[#6B6B6B]">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E8D8C3] disabled:opacity-40 hover:bg-[#F5EFE6] transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
