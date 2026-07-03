import { useState, useEffect } from "react";
import { getMyReservations, cancelReservation, getRestaurants, createReservation } from "../../../shared/api";
import { showConfirmToast } from "../../../shared/utils/confirmToast";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { CalendarDays, Plus, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";

export const ReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resRes, restRes] = await Promise.all([
                    getMyReservations(),
                    getRestaurants({ limit: 50 }),
                ]);
                if (!cancelled) {
                    setReservations(resRes.data.reservations || []);
                    setRestaurants(restRes.data.restaurants || []);
                }
            } catch (err) {
                console.error("Error", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [refreshKey]);

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);
            await createReservation({
                id_restaurante: data.id_restaurante,
                fecha_reserva: new Date(data.fecha_reserva).toISOString(),
                cantidad_personas: parseInt(data.cantidad_personas),
            });
            showSuccess("Reservación creada exitosamente");
            setShowForm(false);
            reset();
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <CalendarDays size={24} className="text-[#E67E22]" />
                        <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Mis Reservaciones</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
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
                                <select
                                    {...register("id_restaurante", { required: "Selecciona un restaurante" })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    {restaurants.map((r) => (
                                        <option key={r._id} value={r._id}>{r.nombre}</option>
                                    ))}
                                </select>
                                {errors.id_restaurante && <p className="text-red-500 text-xs mt-1">{errors.id_restaurante.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Fecha y hora</label>
                                <input
                                    type="datetime-local"
                                    {...register("fecha_reserva", { required: "La fecha es obligatoria" })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                />
                                {errors.fecha_reserva && <p className="text-red-500 text-xs mt-1">{errors.fecha_reserva.message}</p>}
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
                                onClick={() => setShowForm(false)}
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
                                        <p className="text-sm text-[#6B6B6B] flex items-center gap-1 mt-1">
                                            <MapPin size={12} />
                                            {res.id_restaurante?.direccion?.texto}
                                        </p>
                                        <p className="text-sm text-[#6B6B6B] mt-1">
                                            📅 {new Date(res.fecha_reserva).toLocaleDateString("es-GT", {
                                                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </p>
                                        <p className="text-sm text-[#6B6B6B]">
                                            👥 {res.cantidad_personas} personas
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
        </div>
    );
};
