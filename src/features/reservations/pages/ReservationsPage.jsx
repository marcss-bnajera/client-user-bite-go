import { useState, useEffect, useRef, useCallback } from "react";
import { getMyReservations, cancelReservation, getRestaurants, createReservation, getRestaurantReviews, getTablesAvailability } from "../../../shared/api";
import { showConfirmToast } from "../../../shared/utils/confirmToast";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { CalendarDays, Plus, MapPin, Clock, Users, Search, X, Star, Store, DoorOpen, DoorClosed } from "lucide-react";
import { useForm } from "react-hook-form";
import { DatePicker, TimePicker } from "../../../shared/ui/DatePicker";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useAuthStore } from "../../auth/store/authStore";

const isOpen = (horarios) => {
    if (!horarios) return null;
    const now = new Date();
    const [aperturaStr, cierreStr] = horarios.split(" - ");
    const [aH, aM] = aperturaStr.split(":").map(Number);
    const [cH, cM] = cierreStr.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= aH * 60 + aM && mins < cH * 60 + cM;
};

const SucursalPicker = ({ sucursales, onSelect, onClose }) => {
    const [search, setSearch] = useState("");
    const filtered = sucursales.filter((s) =>
        s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        s.direccion?.texto?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-[#E8D8C3]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8D8C3]">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#E67E22]" />
                        <h3 className="font-extrabold text-[#2B2B2B] text-base">Elegir Sucursal</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-[#6B6B6B] transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-5 pt-3 pb-2">
                    <div className="flex items-center gap-2 bg-[#F5EFE6] rounded-xl px-3 py-2 border border-[#E8D8C3] focus-within:border-[#E67E22] transition-colors">
                        <Search size={16} className="text-[#6B6B6B] shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o dirección..."
                            className="bg-transparent outline-none text-sm w-full text-[#2B2B2B] placeholder:text-[#A0A0A0]"
                            autoFocus
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-[#6B6B6B] hover:text-[#C0392B]">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-4">
                    {filtered.length === 0 ? (
                        <div className="text-center py-6">
                            <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-[#6B6B6B] text-sm">No se encontraron sucursales</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {filtered.map((s) => {
                                const open = isOpen(s.horarios_atencion);
                                return (
                                    <button
                                        key={s._id}
                                        type="button"
                                        onClick={() => onSelect(s._id)}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-[#E8D8C3] hover:border-[#E67E22] hover:bg-[#F5EFE6]/50 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-[#F5EFE6] flex items-center justify-center shrink-0">
                                            <MapPin size={20} className="text-[#E67E22]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[#2B2B2B] text-sm truncate group-hover:text-[#E67E22] transition-colors">{s.nombre}</p>
                                            <p className="text-xs text-[#6B6B6B] truncate">{s.direccion?.texto}</p>
                                            <p className="text-[10px] text-[#6B6B6B] mt-0.5">{s.horarios_atencion}</p>
                                        </div>
                                        <div className="shrink-0">
                                            {open !== null && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {open ? "Abierto" : "Cerrado"}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RestaurantPicker = ({ restaurants, onSelect, onClose }) => {
    const [search, setSearch] = useState("");
    const [ratings, setRatings] = useState({});

    const filtered = restaurants.filter((r) =>
        r.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        r.categoria_gastronomica?.toLowerCase().includes(search.toLowerCase()) ||
        r.direccion?.texto?.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (filtered.length === 0) return;
        const ids = filtered.slice(0, 20).map(r => r._id);
        Promise.all(ids.map(id => getRestaurantReviews(id).then(res => [id, res.data.promedio || 0])))
            .then(results => {
                const map = {};
                results.forEach(([id, avg]) => { map[id] = avg; });
                setRatings(map);
            })
            .catch(() => {});
    }, [restaurants.length]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-[#E8D8C3]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8D8C3]">
                    <div className="flex items-center gap-2">
                        <Store size={18} className="text-[#E67E22]" />
                        <h3 className="font-extrabold text-[#2B2B2B] text-base">Elegir Restaurante</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-[#6B6B6B] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-5 pt-3 pb-2">
                    <div className="flex items-center gap-2 bg-[#F5EFE6] rounded-xl px-3 py-2 border border-[#E8D8C3] focus-within:border-[#E67E22] transition-colors">
                        <Search size={16} className="text-[#6B6B6B] shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, categoría o dirección..."
                            className="bg-transparent outline-none text-sm w-full text-[#2B2B2B] placeholder:text-[#A0A0A0]"
                            autoFocus
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-[#6B6B6B] hover:text-[#C0392B]">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-4">
                    {filtered.length === 0 ? (
                        <div className="text-center py-10">
                            <Store size={36} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-[#6B6B6B] text-sm">No se encontraron restaurantes</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 pt-1">
                            {filtered.map((r) => (
                                <button
                                    key={r._id}
                                    type="button"
                                    onClick={() => onSelect(r._id)}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E8D8C3] hover:border-[#E67E22] hover:bg-[#F5EFE6]/50 transition-all text-left group"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F5EFE6] shrink-0 flex items-center justify-center">
                                        {r.fotos_url?.[0] ? (
                                            <img src={r.fotos_url[0]} alt={r.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <Store size={24} className="text-[#E8D8C3]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#2B2B2B] text-sm truncate group-hover:text-[#E67E22] transition-colors">{r.nombre}</p>
                                        <p className="text-xs text-[#6B6B6B] truncate">{r.categoria_gastronomica}</p>
                                        <p className="text-xs text-[#6B6B6B] flex items-center gap-1 truncate mt-0.5">
                                            <MapPin size={10} className="shrink-0" />
                                            {r.direccion?.texto}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {ratings[r._id] > 0 && (
                                            <div className="flex items-center gap-0.5 text-xs text-[#E67E22] font-bold">
                                                <Star size={11} fill="#E67E22" />
                                                {ratings[r._id]}
                                            </div>
                                        )}
                                        <p className="text-[10px] text-[#A0A0A0] mt-0.5">Q{r.precio_promedio}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
    const [fechaReserva, setFechaReserva] = useState(null);
    const [horaReserva, setHoraReserva] = useState("");
    const [idSucursal, setIdSucursal] = useState("");
    const [tableAvailability, setTableAvailability] = useState(null);
    const [showSucursalPicker, setShowSucursalPicker] = useState(false);

    const watchedRestaurantId = watch("id_restaurante");
    const selectedRestaurant = restaurants.find((r) => r._id === watchedRestaurantId);
    const tieneSucursales = selectedRestaurant?.tiene_sucursales ?? false;
    const sucursales = tieneSucursales ? (selectedRestaurant?.sucursales ?? []).filter(s => s.activo !== false) : [];

    const horarios = idSucursal && selectedRestaurant?.sucursales?.length
        ? selectedRestaurant.sucursales.find(s => s._id === idSucursal)?.horarios_atencion
        : selectedRestaurant?.horarios_atencion;

    let openingTime = "";
    let closingTime = "";
    if (horarios) {
        const [aperturaStr, cierreStr] = horarios.split(" - ");
        openingTime = aperturaStr;
        const [cH, cM] = cierreStr.split(":").map(Number);
        const cierreDate = new Date();
        cierreDate.setHours(cH, cM, 0, 0);
        cierreDate.setMinutes(cierreDate.getMinutes() - 90);
        closingTime = `${String(cierreDate.getHours()).padStart(2, "0")}:${String(cierreDate.getMinutes()).padStart(2, "0")}`;
    }

    useEffect(() => {
        setIdSucursal("");
        setTableAvailability(null);
    }, [watchedRestaurantId]);

    useEffect(() => {
        if (!watchedRestaurantId || !fechaReserva || !horaReserva) {
            setTableAvailability(null);
            return;
        }
        const fetchAvailability = async () => {
            try {
                const [h, m] = horaReserva.split(":");
                const dt = new Date(fechaReserva);
                dt.setHours(parseInt(h), parseInt(m), 0, 0);
                const isoStr = dt.toISOString();

                const params = { id_restaurante: watchedRestaurantId, fecha_reserva: isoStr };
                if (idSucursal) params.id_sucursal = idSucursal;

                const { data } = await getTablesAvailability(params);
                setTableAvailability(data);
            } catch {
                setTableAvailability(null);
            }
        };
        fetchAvailability();
    }, [watchedRestaurantId, fechaReserva, horaReserva, idSucursal]);

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [resRes, restRes] = await Promise.all([
                getMyReservations(),
                getRestaurants({ limit: 50 }),
            ]);
            if (mountedRef.current) {
                setReservations(resRes.data.reservations || []);
                setRestaurants(restRes.data.restaurants || []);
            }
        } catch {
        } finally {
            if (mountedRef.current && !silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchData(false);
        return () => { mountedRef.current = false; };
    }, [fetchData, refreshKey]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") fetchData(true);
        }, 8000);
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchData]);

    const onSubmit = async (data) => {
        if (!fechaReserva) {
            showError("Selecciona una fecha");
            return;
        }
        if (!horaReserva) {
            showError("Selecciona una hora");
            return;
        }
        if (tieneSucursales && !idSucursal) {
            showError("Selecciona una sucursal");
            return;
        }
        try {
            setSubmitting(true);
            const [h, m] = horaReserva.split(":");
            const dt = new Date(fechaReserva);
            dt.setHours(parseInt(h), parseInt(m), 0, 0);

            const now = new Date();
            if (dt <= now) {
                showError("La fecha y hora deben ser en el futuro");
                return;
            }

            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 1);
            if (dt > maxDate) {
                showError("No puedes reservar con más de 1 mes de anticipación");
                return;
            }

            const horariosSubmit = idSucursal && selectedRestaurant?.sucursales?.length
                ? selectedRestaurant.sucursales.find(s => s._id === idSucursal)?.horarios_atencion
                : selectedRestaurant?.horarios_atencion;

            if (horariosSubmit) {
                const [, cierreStr] = horariosSubmit.split(" - ");
                const [cierreH, cierreM] = cierreStr.split(":").map(Number);
                const cierreDate = new Date(fechaReserva);
                cierreDate.setHours(cierreH, cierreM, 0, 0);
                cierreDate.setMinutes(cierreDate.getMinutes() - 90);
                if (dt > cierreDate) {
                    showError(`La reserva debe ser al menos 1.5 horas antes del cierre (${cierreStr})`);
                    return;
                }
            }

            await createReservation({
                id_restaurante: data.id_restaurante,
                id_sucursal: idSucursal,
                fecha_reserva: dt.toISOString(),
                cantidad_personas: parseInt(data.cantidad_personas),
            });
            showSuccess("Reservación creada exitosamente");
            setShowForm(false);
            reset();
            setFechaReserva(null);
            setHoraReserva("");
            setIdSucursal("");
            setTableAvailability(null);
            setRefreshKey((k) => k + 1);
        } catch (err) {
            showError(err.response?.data?.message || "Error al crear reservación");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = (id) => {
        showConfirmToast({
            title: "Cancelar Reservación",
            message: "¿Estás seguro de que deseas cancelar esta reservación?",
            type: "delete",
            onConfirm: async () => {
                try {
                    await cancelReservation(id);
                    showSuccess("Reservación cancelada");
                    setRefreshKey((k) => k + 1);
                } catch (err) {
                    showError(err.response?.data?.message || "No se pudo cancelar");
                }
            },
        });
    };

    const resetForm = () => {
        reset();
        setFechaReserva(null);
        setHoraReserva("");
        setIdSucursal("");
        setTableAvailability(null);
    };

    const handleOpenForm = () => {
        resetForm();
        setShowForm(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <CalendarDays size={24} className="text-[#E67E22]" />
                        <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Mis Reservaciones</h1>
                    </div>
                    <button
                        onClick={handleOpenForm}
                        className="bg-[#E67E22] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#D35400] transition-colors"
                    >
                        <Plus size={16} className="inline mr-1" />
                        Nueva Reserva
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-[#E8D8C3] p-6 mb-6">
                        <h3 className="font-bold text-[#2B2B2B] mb-4">Nueva Reservación</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Restaurante</label>
                                <input type="hidden" {...register("id_restaurante", { required: "Selecciona un restaurante" })} />
                                <button
                                    type="button"
                                    onClick={() => setShowPicker(true)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-lg outline-none text-left transition-colors ${
                                        errors.id_restaurante
                                            ? "border-red-400 bg-red-50"
                                            : selectedRestaurant
                                                ? "border-[#E8D8C3] bg-white text-[#2B2B2B]"
                                                : "border-gray-300 bg-white text-[#A0A0A0] hover:border-[#E67E22]"
                                    }`}
                                >
                                    <Store size={14} className="text-[#E67E22] shrink-0" />
                                    {selectedRestaurant ? (
                                        <>
                                            <span className="font-semibold truncate">{selectedRestaurant.nombre}</span>
                                            {isOpen(horarios) !== null && (
                                                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isOpen(horarios) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {isOpen(horarios) ? "Abierto" : "Cerrado"}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span>Seleccionar restaurante...</span>
                                    )}
                                </button>
                                {errors.id_restaurante && <p className="text-red-500 text-xs mt-1">{errors.id_restaurante.message}</p>}
                            </div>
                            {tieneSucursales && sucursales.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-1">Sucursal</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowSucursalPicker(true)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-[#E8D8C3] bg-white rounded-lg outline-none text-left hover:border-[#E67E22] transition-colors"
                                    >
                                        <MapPin size={14} className="text-[#E67E22] shrink-0" />
                                        {idSucursal ? (
                                            <span className="font-semibold text-[#2B2B2B] truncate">
                                                {sucursales.find(s => s._id === idSucursal)?.nombre || "Sucursal"}
                                            </span>
                                        ) : (
                                            <span className="text-[#A0A0A0]">Seleccionar sucursal...</span>
                                        )}
                                    </button>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Fecha</label>
                                <DatePicker
                                    value={fechaReserva}
                                    onChange={setFechaReserva}
                                    placeholder="Seleccionar fecha"
                                    maxDate={(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; })()}
                                />
                                {fechaReserva && (
                                    <p className="text-xs text-[#E67E22] mt-1 font-semibold">
                                        {format(fechaReserva, "EEE d MMM, yyyy", { locale: es })}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Hora</label>
                                <TimePicker
                                    value={horaReserva}
                                    onChange={setHoraReserva}
                                    placeholder="Seleccionar hora"
                                    selectedDate={fechaReserva}
                                    openingTime={openingTime}
                                    closingTime={closingTime}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Personas</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    {...register("cantidad_personas", { required: "Cantidad obligatoria", min: 1, max: 20 })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                />
                                {errors.cantidad_personas && <p className="text-red-500 text-xs mt-1">{errors.cantidad_personas.message}</p>}
                            </div>
                        </div>

                        {/* Indicador de disponibilidad de mesas */}
                        {tableAvailability && fechaReserva && horaReserva && (
                            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mt-2 ${tableAvailability.disponibles === 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                                {tableAvailability.disponibles === 0 ? (
                                    <DoorClosed size={16} className="text-red-500 shrink-0" />
                                ) : (
                                    <DoorOpen size={16} className="text-green-600 shrink-0" />
                                )}
                                <p className={`text-sm font-semibold ${tableAvailability.disponibles === 0 ? "text-red-700" : "text-green-700"}`}>
                                    {tableAvailability.disponibles === 0
                                        ? "No hay mesas disponibles para esta fecha y hora"
                                        : `${tableAvailability.disponibles} mesa(s) disponible(s) para ${format(fechaReserva, "EEE d MMM", { locale: es })} a las ${horaReserva}`}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3 mt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#E67E22] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#D35400] transition-colors disabled:opacity-60"
                            >
                                {submitting ? "Creando..." : "Confirmar Reserva"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="border border-[#E8D8C3] text-[#6B6B6B] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#F5EFE6] transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-[#E8D8C3] p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="text-center py-20">
                        <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No tienes reservaciones</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((res) => (
                            <div key={res._id} className="bg-white rounded-xl border border-[#E8D8C3] p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-[#2B2B2B]">
                                            {res.id_restaurante?.nombre || "Restaurante"}
                                        </h3>
                                        {res.id_sucursal && res.id_restaurante?.sucursales?.length > 0 && (
                                            <p className="text-xs text-[#E67E22] font-semibold mt-0.5">
                                                {res.id_restaurante.sucursales.find(s => s._id === res.id_sucursal)?.nombre || "Sucursal"}
                                            </p>
                                        )}
                                        <p className="text-sm text-[#6B6B6B] flex items-center gap-1 mt-1">
                                            <MapPin size={12} />
                                            {res.id_restaurante?.direccion?.texto}
                                        </p>
                                        <p className="text-sm text-[#6B6B6B] mt-1 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(res.fecha_reserva).toLocaleDateString("es-GT", {
                                                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </p>
                                        <p className="text-sm text-[#6B6B6B] flex items-center gap-1">
                                            <Users size={12} />
                                            {res.cantidad_personas} personas
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            res.estado === "Confirmada" ? "bg-green-100 text-green-700" :
                                            res.estado === "Cancelada" ? "bg-red-100 text-red-700" :
                                            "bg-blue-100 text-blue-700"
                                        }`}>
                                            {res.estado}
                                        </span>
                                    </div>
                                </div>
                                {res.estado === "Confirmada" && (
                                    <div className="mt-3 pt-3 border-t border-[#F5EFE6]">
                                        <button
                                            onClick={() => handleCancel(res._id)}
                                            className="text-xs text-red-500 hover:text-red-700 font-semibold"
                                        >
                                            Cancelar reservación
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showPicker && (
                <RestaurantPicker
                    restaurants={restaurants}
                    onSelect={(id) => {
                        setValue("id_restaurante", id, { shouldValidate: true });
                        setShowPicker(false);
                    }}
                    onClose={() => setShowPicker(false)}
                />
            )}

            {showSucursalPicker && (
                <SucursalPicker
                    sucursales={sucursales}
                    onSelect={(id) => {
                        setIdSucursal(id);
                        setShowSucursalPicker(false);
                    }}
                    onClose={() => setShowSucursalPicker(false)}
                />
            )}
        </div>
    );
};
