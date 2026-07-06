import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurantById, getMenuByRestaurant, getEventsByRestaurant, getRestaurantReviews, createReview } from "../../../shared/api";
import { MapPin, Clock, Phone, Mail, ArrowLeft, UtensilsCrossed, CalendarDays, Star, ShoppingBag, Send } from "lucide-react";
import { useAuthStore } from "../../auth/store/authStore";
import { showSuccess, showError } from "../../../shared/utils/toast";

export const RestaurantDetailPage = () => {
    const { id } = useParams();
    const user = useAuthStore((s) => s.user);
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [events, setEvents] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("menu");
    const [loading, setLoading] = useState(true);

    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [restRes, menuRes, eventsRes, revRes] = await Promise.all([
                    getRestaurantById(id),
                    getMenuByRestaurant(id),
                    getEventsByRestaurant(id),
                    getRestaurantReviews(id),
                ]);
                setRestaurant(restRes.data.restaurant);
                setMenu(menuRes.data.menu || []);
                setEvents(eventsRes.data.eventos || []);
                setReviews(revRes.data.reviews || []);
            } catch (err) {
                console.error("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (reviewRating === 0) {
            showError("Selecciona una calificación");
            return;
        }
        try {
            setSubmittingReview(true);
            await createReview({
                id_restaurante: id,
                calificacion: reviewRating,
                comentario: reviewComment,
            });
            showSuccess("Reseña publicada");
            setReviewRating(0);
            setReviewComment("");
            const revRes = await getRestaurantReviews(id);
            setReviews(revRes.data.reviews || []);
        } catch (err) {
            showError(err.response?.data?.message || "Error al publicar reseña");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E22]"></div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Restaurante no encontrado</p>
            </div>
        );
    }

    const tabs = [
        { id: "menu", label: "Menú", icon: UtensilsCrossed },
        { id: "events", label: "Eventos", icon: CalendarDays },
        { id: "reviews", label: "Reseñas", icon: Star },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="relative bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white">
                {restaurant.fotos_url?.[0] && (
                    <img
                        src={restaurant.fotos_url[0]}
                        alt={restaurant.nombre}
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                )}
                <div className="relative py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        <Link to="/restaurants" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4 transition-colors">
                            <ArrowLeft size={16} />
                            Volver a restaurantes
                        </Link>
                        <h1 className="text-3xl font-extrabold">{restaurant.nombre}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/80">
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {restaurant.direccion?.texto}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {restaurant.horarios_atencion}
                            </span>
                            {restaurant.informacion_contacto?.telefono && (
                                <span className="flex items-center gap-1">
                                    <Phone size={14} />
                                    {restaurant.informacion_contacto.telefono}
                                </span>
                            )}
                            {restaurant.informacion_contacto?.email && (
                                <span className="flex items-center gap-1">
                                    <Mail size={14} />
                                    {restaurant.informacion_contacto.email}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                                {restaurant.categoria_gastronomica}
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                                Q{restaurant.precio_promedio} promedio
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-1 border-b border-[#E8D8C3] -mb-px">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? "border-[#E67E22] text-[#E67E22]"
                                    : "border-transparent text-[#6B6B6B] hover:text-[#2B2B2B]"
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 pb-12">
                {activeTab === "menu" && (
                    <div className="space-y-4">
                        {menu.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">Este restaurante aún no tiene menú disponible</p>
                        ) : (
                            menu.map((product) => (
                                <div key={product._id} className="bg-white rounded-xl border border-[#E8D8C3] p-4 flex gap-4">
                                    <div className="w-20 h-20 rounded-lg bg-[#F5EFE6] flex items-center justify-center shrink-0">
                                        {product.foto_url?.[0] ? (
                                            <img src={product.foto_url[0]} alt={product.nombre} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <UtensilsCrossed size={24} className="text-[#E67E22]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[#2B2B2B]">{product.nombre}</h3>
                                        <p className="text-sm text-[#6B6B6B] truncate">{product.descripcion}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-[#E67E22] bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                                                {product.categoria?.nombre}
                                            </span>
                                            <span className="font-bold text-[#2B2B2B]">Q{product.precio}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <Link
                            to={`/restaurants/${id}/menu`}
                            className="block text-center bg-[#E67E22] text-white py-3 rounded-xl font-bold hover:bg-[#D35400] transition-colors mt-6"
                        >
                            <ShoppingBag size={18} className="inline mr-2" />
                            Ver menú completo y ordenar
                        </Link>
                    </div>
                )}

                {activeTab === "events" && (
                    <div className="space-y-4">
                        {events.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No hay eventos programados</p>
                        ) : (
                            events.map((event, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-[#E8D8C3] p-4">
                                    <h3 className="font-bold text-[#2B2B2B]">{event.nombre}</h3>
                                    {event.descripcion && (
                                        <p className="text-sm text-[#6B6B6B] mt-1">{event.descripcion}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {event.fechas?.map((fecha, i) => (
                                            <span key={i} className="text-xs bg-[#F5EFE6] text-[#E67E22] px-2 py-1 rounded-full font-semibold">
                                                {new Date(fecha).toLocaleDateString("es-GT")}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="space-y-4">
                        {reviews.length > 0 && (
                            <div className="bg-white rounded-xl border border-[#E8D8C3] p-4 text-center">
                                <p className="text-3xl font-extrabold text-[#E67E22]">
                                    {(reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length).toFixed(1)}
                                </p>
                                <p className="text-sm text-[#6B6B6B]">Promedio de {reviews.length} reseñas</p>
                            </div>
                        )}

                        {user && (
                            <form onSubmit={handleSubmitReview} className="bg-white rounded-xl border border-[#E8D8C3] p-4">
                                <h3 className="font-bold text-[#2B2B2B] mb-3">Escribir reseña</h3>
                                <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="cursor-pointer"
                                        >
                                            <Star
                                                size={24}
                                                className={star <= reviewRating ? "fill-[#E67E22] text-[#E67E22]" : "text-gray-300"}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Cuéntanos tu experiencia (opcional)"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none resize-none"
                                    rows={3}
                                    maxLength={500}
                                />
                                <button
                                    type="submit"
                                    disabled={submittingReview || reviewRating === 0}
                                    className="mt-2 bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <Send size={14} />
                                    {submittingReview ? "Enviando..." : "Publicar"}
                                </button>
                            </form>
                        )}

                        {reviews.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">Aún no hay reseñas</p>
                        ) : (
                            reviews.map((review, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-[#E8D8C3] p-4">
                                    <div className="flex items-center gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={i < review.calificacion ? "fill-[#E67E22] text-[#E67E22]" : "text-gray-300"}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-[#2B2B2B]">{review.comentario}</p>
                                    <p className="text-xs text-[#6B6B6B] mt-2">
                                        {new Date(review.createdAt).toLocaleDateString("es-GT")}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
