import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurantById, getMenuByRestaurant, getEventsByRestaurant, getRestaurantReviews, getEligibleForReview, createReview } from "../../../shared/api";
import { MapPin, Clock, Phone, Mail, ArrowLeft, UtensilsCrossed, CalendarDays, Star, ShoppingBag, Send, ChevronDown, ChevronUp, X, ShoppingBag as BagIcon, Users, Calendar, Hash, Truck, Utensils, Search } from "lucide-react";
import { useAuthStore } from "../../auth/store/authStore";
import { showSuccess, showError } from "../../../shared/utils/toast";

const ReviewPicker = ({ eligibleItems, onSelect, onClose }) => {
    const [tab, setTab] = useState("orders");

    const serviceIcon = {
        "Comer aquí": <Utensils size={13} />,
        "Domicilio": <Truck size={13} />,
        "Para llevar": <BagIcon size={13} />,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-[#E8D8C3]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8D8C3]">
                    <div className="flex items-center gap-2">
                        <Star size={18} className="text-[#E67E22]" />
                        <h3 className="font-extrabold text-[#2B2B2B] text-base">¿Qué querés calificar?</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-[#6B6B6B] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex border-b border-[#E8D8C3]">
                    <button
                        onClick={() => setTab("orders")}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                            tab === "orders" ? "border-[#E67E22] text-[#E67E22]" : "border-transparent text-[#6B6B6B]"
                        }`}
                    >
                        <ShoppingBag size={14} />
                        Pedidos ({eligibleItems.orders.filter(o => !o.reviewed).length})
                    </button>
                    <button
                        onClick={() => setTab("reservations")}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                            tab === "reservations" ? "border-[#E67E22] text-[#E67E22]" : "border-transparent text-[#6B6B6B]"
                        }`}
                    >
                        <CalendarDays size={14} />
                        Reservaciones ({eligibleItems.reservations.filter(r => !r.reviewed).length})
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {tab === "orders" && (
                        <>
                            {eligibleItems.orders.filter(o => !o.reviewed).length === 0 ? (
                                <div className="text-center py-10">
                                    <ShoppingBag size={36} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-[#6B6B6B] text-sm">No hay pedidos para calificar</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {eligibleItems.orders.filter(o => !o.reviewed).map((o) => (
                                        <button
                                            key={o._id}
                                            type="button"
                                            onClick={() => onSelect({ type: "order", ...o })}
                                            className="w-full text-left p-3 rounded-xl border border-[#E8D8C3] hover:border-[#E67E22] hover:bg-[#F5EFE6]/50 transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        o.estado === "Entregado" ? "bg-green-100" : "bg-red-100"
                                                    }`}>
                                                        {o.estado === "Entregado"
                                                            ? <ShoppingBag size={14} className="text-green-600" />
                                                            : <X size={14} className="text-red-500" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-[#2B2B2B] text-sm group-hover:text-[#E67E22] transition-colors">
                                                            Pedido #{o._id.slice(-6).toUpperCase()}
                                                        </p>
                                                        <p className="text-[11px] text-[#6B6B6B]">
                                                            {new Date(o.createdAt).toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" })}
                                                            {" · "}
                                                            <span className={o.estado === "Entregado" ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                                                                {o.estado}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-[#2B2B2B] text-sm shrink-0">Q{o.total?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#6B6B6B]">
                                                {o.tipo_servicio && (
                                                    <span className="flex items-center gap-1 bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                                                        {serviceIcon[o.tipo_servicio]} {o.tipo_servicio}
                                                    </span>
                                                )}
                                                {o.mesero && (
                                                    <span className="flex items-center gap-1 bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                                                        <Utensils size={10} /> {o.mesero}
                                                    </span>
                                                )}
                                                {o.repartidor && (
                                                    <span className="flex items-center gap-1 bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                                                        <Truck size={10} /> {o.repartidor}
                                                    </span>
                                                )}
                                            </div>
                                            {o.items?.length > 0 && (
                                                <p className="text-[11px] text-[#6B6B6B] mt-1.5 truncate">
                                                    {o.items.map(i => `${i.nombre} x${i.cantidad}`).join(", ")}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {tab === "reservations" && (
                        <>
                            {eligibleItems.reservations.filter(r => !r.reviewed).length === 0 ? (
                                <div className="text-center py-10">
                                    <CalendarDays size={36} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-[#6B6B6B] text-sm">No hay reservaciones para calificar</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {eligibleItems.reservations.filter(r => !r.reviewed).map((r) => (
                                        <button
                                            key={r._id}
                                            type="button"
                                            onClick={() => onSelect({ type: "reservation", ...r })}
                                            className="w-full text-left p-3 rounded-xl border border-[#E8D8C3] hover:border-[#E67E22] hover:bg-[#F5EFE6]/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                                    <CalendarDays size={14} className="text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#2B2B2B] text-sm group-hover:text-[#E67E22] transition-colors">
                                                        Reservación
                                                    </p>
                                                    <p className="text-[11px] text-[#6B6B6B]">
                                                        {new Date(r.fecha_reserva).toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" })}
                                                        {" a las "}
                                                        {new Date(r.fecha_reserva).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#6B6B6B]">
                                                <span className="flex items-center gap-1 bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                                                    <Users size={10} /> {r.cantidad_personas} personas
                                                </span>
                                                {r.mesa_numero && (
                                                    <span className="flex items-center gap-1 bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                                                        <Hash size={10} /> Mesa {r.mesa_numero}
                                                    </span>
                                                )}
                                                {r.sucursal_nombre && (
                                                    <span className="flex items-center gap-1 bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                                                        <MapPin size={10} /> {r.sucursal_nombre}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                                    Asistió
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const RestaurantDetailPage = () => {
    const { id } = useParams();
    const user = useAuthStore((s) => s.user);
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [events, setEvents] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("menu");
    const [loading, setLoading] = useState(true);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [showSucursalModal, setShowSucursalModal] = useState(false);
    const [sucursalSearch, setSucursalSearch] = useState("");

    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [eligibleItems, setEligibleItems] = useState({ orders: [], reservations: [] });
    const [selectedItem, setSelectedItem] = useState(null);
    const [showReviewPicker, setShowReviewPicker] = useState(false);

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

                const rest = restRes.data.restaurant;
                if (rest?.tiene_sucursales && rest.sucursales?.length > 0) {
                    const activa = rest.sucursales.find((s) => s.activo !== false);
                    if (activa) setSelectedSucursal(activa._id);
                }
            } catch (err) {
                console.error("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        setSelectedItem(null);
    }, [selectedSucursal]);

    useEffect(() => {
        if (activeTab === "reviews") {
            const params = selectedSucursal ? { id_sucursal: selectedSucursal } : {};
            getRestaurantReviews(id, params)
                .then((res) => setReviews(res.data.reviews || []))
                .catch(() => {});
        }
    }, [activeTab, id, selectedSucursal]);

    useEffect(() => {
        if (activeTab === "reviews" && user) {
            const eligibleParams = selectedSucursal ? { id_sucursal: selectedSucursal } : {};
            getEligibleForReview(id, eligibleParams)
                .then((res) => setEligibleItems({ orders: res.data.orders || [], reservations: res.data.reservations || [] }))
                .catch(() => {});
        }
    }, [activeTab, id, user, selectedSucursal]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (reviewRating === 0) {
            showError("Selecciona una calificación");
            return;
        }
        if (!selectedItem) {
            showError("Selecciona un pedido o reservación para calificar");
            return;
        }
        try {
            setSubmittingReview(true);
            const payload = {
                id_restaurante: id,
                calificacion: reviewRating,
                comentario: reviewComment,
            };
            if (selectedItem.type === "order") {
                payload.id_pedido = selectedItem._id;
                if (selectedItem.id_sucursal) payload.id_sucursal = selectedItem.id_sucursal;
            } else {
                payload.id_reservacion = selectedItem._id;
                if (selectedItem.id_sucursal) payload.id_sucursal = selectedItem.id_sucursal;
            }
            await createReview(payload);
            showSuccess("Reseña publicada");
            setReviewRating(0);
            setReviewComment("");
            setSelectedItem(null);
            const reviewParams = selectedSucursal ? { id_sucursal: selectedSucursal } : {};
            const eligibleParams = selectedSucursal ? { id_sucursal: selectedSucursal } : {};
            const [revRes, eligibleRes] = await Promise.all([
                getRestaurantReviews(id, reviewParams),
                getEligibleForReview(id, eligibleParams),
            ]);
            setReviews(revRes.data.reviews || []);
            setEligibleItems({ orders: eligibleRes.data.orders || [], reservations: eligibleRes.data.reservations || [] });
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

            {restaurant.tiene_sucursales && restaurant.sucursales?.length > 0 && (() => {
                const activas = restaurant.sucursales.filter(s => s.activo !== false);
                const sel = activas.find(s => s._id === selectedSucursal);
                return (
                    <div className="max-w-4xl mx-auto px-4 pt-5">
                        <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2">Sucursal</p>
                        <button
                            onClick={() => { setSucursalSearch(""); setShowSucursalModal(true); }}
                            className="w-full flex items-center justify-between gap-2 bg-white border border-[#E8D8C3] rounded-xl px-4 py-3 text-left hover:border-[#E67E22] transition-colors"
                        >
                            <div className="min-w-0">
                                {sel ? (
                                    <>
                                        <p className="font-bold text-[#2B2B2B] text-sm truncate">{sel.nombre}</p>
                                        <p className="text-xs text-[#6B6B6B] truncate">{sel.direccion?.texto}</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-[#6B6B6B]">Seleccionar sucursal...</p>
                                )}
                            </div>
                            <ChevronDown size={16} className="text-[#6B6B6B] shrink-0" />
                        </button>
                    </div>
                );
            })()}

            {showSucursalModal && restaurant.sucursales && (() => {
                const activas = restaurant.sucursales.filter(s => s.activo !== false);
                const q = sucursalSearch.toLowerCase();
                const filtered = q ? activas.filter(s =>
                    s.nombre.toLowerCase().includes(q) ||
                    (s.direccion?.texto || "").toLowerCase().includes(q)
                ) : activas;
                return (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8D8C3]">
                                <h3 className="font-extrabold text-[#2B2B2B] text-base">Selecciona una sucursal</h3>
                                <button onClick={() => setShowSucursalModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-[#6B6B6B]">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="px-5 pt-3">
                                <div className="flex items-center gap-2 bg-[#F5EFE6] rounded-xl px-3 h-10">
                                    <Search size={14} className="text-[#6B6B6B] shrink-0" />
                                    <input
                                        autoFocus
                                        value={sucursalSearch}
                                        onChange={(e) => setSucursalSearch(e.target.value)}
                                        placeholder="Buscar por nombre o dirección..."
                                        className="outline-none text-sm w-full bg-transparent text-[#2B2B2B] placeholder:text-[#6B6B6B]"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                                {filtered.length === 0 ? (
                                    <p className="text-center text-[#6B6B6B] text-sm py-8">No se encontraron sucursales</p>
                                ) : filtered.map((s) => (
                                    <button
                                        key={s._id}
                                        onClick={() => { setSelectedSucursal(s._id); setShowSucursalModal(false); }}
                                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                                            selectedSucursal === s._id
                                                ? "border-[#E67E22] bg-[#FDF6EE]"
                                                : "border-[#E8D8C3] hover:border-[#E67E22] hover:bg-[#F5EFE6]/50"
                                        }`}
                                    >
                                        <p className={`font-bold text-sm ${selectedSucursal === s._id ? "text-[#E67E22]" : "text-[#2B2B2B]"}`}>{s.nombre}</p>
                                        {s.direccion?.texto && <p className="text-xs text-[#6B6B6B] mt-0.5">{s.direccion.texto}</p>}
                                        {s.horarios_atencion && <p className="text-[11px] text-[#6B6B6B] mt-0.5">{s.horarios_atencion}</p>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

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
                            to={`/restaurants/${id}/menu${selectedSucursal ? `?id_sucursal=${selectedSucursal}` : ""}`}
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
                                <p className="text-sm text-[#6B6B6B]">
                                    Promedio de {reviews.length} reseñas
                                    {selectedSucursal && restaurant?.sucursales && (() => {
                                        const suc = restaurant.sucursales.find(s => s._id === selectedSucursal);
                                        return suc ? <> de <span className="font-semibold text-[#2B2B2B]">{suc.nombre}</span></> : null;
                                    })()}
                                </p>
                            </div>
                        )}

                        {user && (
                            <form onSubmit={handleSubmitReview} className="bg-white rounded-xl border border-[#E8D8C3] p-4">
                                <h3 className="font-bold text-[#2B2B2B] mb-3">Escribir reseña</h3>
                                {eligibleItems.orders.length === 0 && eligibleItems.reservations.length === 0 ? (
                                    <p className="text-sm text-[#6B6B6B] py-2">No tenés pedidos o reservaciones para calificar en este restaurante.</p>
                                ) : (
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">¿Qué querés calificar?</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowReviewPicker(true)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg text-left hover:border-[#E67E22] transition-colors bg-white"
                                        >
                                            <Star size={14} className="text-[#E67E22] shrink-0" />
                                            {selectedItem ? (
                                                <span className="font-semibold text-[#2B2B2B] truncate">
                                                    {selectedItem.type === "order"
                                                        ? `Pedido #${selectedItem._id.slice(-6).toUpperCase()}`
                                                        : `Reservación ${new Date(selectedItem.fecha_reserva).toLocaleDateString("es-GT")}`}
                                                </span>
                                            ) : (
                                                <span className="text-[#A0A0A0]">Seleccionar pedido o reservación...</span>
                                            )}
                                        </button>
                                    </div>
                                )}
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
                                    disabled={submittingReview || reviewRating === 0 || !selectedItem}
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
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-[#6B6B6B]">
                                            {new Date(review.createdAt).toLocaleDateString("es-GT")}
                                        </p>
                                        {review.id_sucursal && restaurant?.tiene_sucursales && restaurant?.sucursales && (() => {
                                            const suc = restaurant.sucursales.find(s => s._id === review.id_sucursal);
                                            return suc ? (
                                                <span className="text-[11px] text-[#E67E22] bg-[#F5EFE6] px-2 py-0.5 rounded-full font-semibold">
                                                    {suc.nombre}
                                                </span>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {showReviewPicker && (
                <ReviewPicker
                    eligibleItems={eligibleItems}
                    onSelect={(item) => {
                        setSelectedItem(item);
                        setShowReviewPicker(false);
                    }}
                    onClose={() => setShowReviewPicker(false)}
                />
            )}
        </div>
    );
};
