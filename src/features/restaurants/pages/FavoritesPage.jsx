import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { Heart, MapPin, Clock, ArrowLeft } from "lucide-react";

export const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const { data } = await getFavorites();
                setFavorites(data.favoritos || []);
            } catch {
                showError("Error al cargar favoritos");
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleRemove = async (id) => {
        try {
            await toggleFavorite(id);
            setFavorites(prev => prev.filter(f => f._id !== id));
            showSuccess("Eliminado de favoritos");
        } catch {
            showError("Error al eliminar favorito");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E22]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <Link to="/restaurants" className="inline-flex items-center gap-1 text-[#6B6B6B] hover:text-[#E67E22] text-sm mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Volver a restaurantes
                </Link>
                <div className="flex items-center gap-3 mb-6">
                    <Heart size={24} className="text-[#E67E22]" />
                    <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Mis Favoritos</h1>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Aún no tienes favoritos</p>
                        <Link to="/restaurants" className="inline-block mt-4 bg-[#E67E22] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#D35400] transition-colors">
                            Explorar restaurantes
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {favorites.map((restaurant) => (
                            <div key={restaurant._id} className="bg-white rounded-xl border border-[#E8D8C3] overflow-hidden flex">
                                <Link to={`/restaurants/${restaurant._id}`} className="w-28 h-28 shrink-0 bg-[#F5EFE6] flex items-center justify-center">
                                    {restaurant.fotos_url?.[0] ? (
                                        <img src={restaurant.fotos_url[0]} alt={restaurant.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">🍽️</span>
                                    )}
                                </Link>
                                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                                    <div>
                                        <Link to={`/restaurants/${restaurant._id}`} className="font-bold text-[#2B2B2B] hover:text-[#E67E22] transition-colors truncate block">
                                            {restaurant.nombre}
                                        </Link>
                                        <div className="flex items-center gap-1 text-xs text-[#6B6B6B] mt-0.5">
                                            <MapPin size={12} />
                                            <span className="truncate">{restaurant.direccion?.texto}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs font-semibold text-[#E67E22] bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                                            {restaurant.categoria_gastronomica}
                                        </span>
                                        <button
                                            onClick={() => handleRemove(restaurant._id)}
                                            className="text-[#6B6B6B] hover:text-[#C0392B] transition-colors"
                                            title="Eliminar de favoritos"
                                        >
                                            <Heart size={16} className="fill-[#E67E22] text-[#E67E22]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
