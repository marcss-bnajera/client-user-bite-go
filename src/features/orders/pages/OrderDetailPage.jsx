import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../../../shared/api";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { showSuccess } from "../../../shared/utils/toast";
import { useAuthStore } from "../../auth/store/authStore";

const ORDER_STEPS = ["Pendiente", "Preparacion", "Listo", "Servido", "Entregado"];

export const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const mountedRef = useRef(true);

    const fetchOrder = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const { data } = await getOrderById(id);
            if (mountedRef.current) setOrder(data.order || null);
        } catch {
            // silencioso en polling
        } finally {
            if (mountedRef.current && !silent) setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        mountedRef.current = true;
        fetchOrder(false);
        return () => { mountedRef.current = false; };
    }, [fetchOrder]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") fetchOrder(true);
        }, 8000);
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchOrder]);

    const getStepIndex = (estado) => {
        if (estado === "Cancelado") return -1;
        return ORDER_STEPS.indexOf(estado);
    };

    const currentStep = order ? getStepIndex(order.estado) : -1;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E22]"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Pedido no encontrado</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <Link to="/orders" className="inline-flex items-center gap-1 text-[#6B6B6B] hover:text-[#E67E22] text-sm mb-4">
                    <ArrowLeft size={16} />
                    Volver a pedidos
                </Link>

                {order.estado === "Entregado" && (
                    <Link
                        to={`/restaurants/${order.id_restaurante?._id}/menu?repeat=${order._id}&items=${encodeURIComponent(JSON.stringify(order.items?.map(i => ({ id_producto: i.id_producto, nombre: i.nombre_historico, precio: i.precio_historico, cantidad: i.cantidad }))))}`}
                        className="inline-flex items-center gap-2 ml-3 px-4 py-2 bg-[#E67E22] text-white text-sm font-semibold rounded-lg hover:bg-[#D35400] transition-colors"
                    >
                        <RotateCcw size={14} />
                        Repetir pedido
                    </Link>
                )}

                <div className="bg-white rounded-xl border border-[#E8D8C3] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-extrabold text-[#2B2B2B]">
                            Pedido #{order._id.slice(-6).toUpperCase()}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.estado === "Entregado" ? "bg-green-100 text-green-700" :
                            order.estado === "Cancelado" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                        }`}>
                            {order.estado}
                        </span>
                    </div>

                    {order.estado !== "Cancelado" && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                {ORDER_STEPS.map((step, idx) => (
                                    <div key={step} className="flex flex-col items-center flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            idx <= currentStep ? "bg-green-500 text-white" :
                                            "bg-gray-200 text-gray-500"
                                        }`}>
                                            {idx <= currentStep ? <Check size={14} /> : idx + 1}
                                        </div>
                                        <span className={`text-xs mt-1 text-center ${
                                            idx <= currentStep ? "text-[#2B2B2B] font-semibold" : "text-gray-400"
                                        }`}>
                                            {step}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 text-sm text-[#6B6B6B] mb-4">
                        <p><span className="font-semibold text-[#2B2B2B]">Restaurante:</span> {order.id_restaurante?.nombre}</p>
                        <p><span className="font-semibold text-[#2B2B2B]">Tipo:</span> {order.tipo_servicio}</p>
                        <p><span className="font-semibold text-[#2B2B2B]">Fecha:</span> {new Date(order.createdAt).toLocaleDateString("es-GT", {
                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}</p>
                    </div>

                    <div className="border-t border-[#F5EFE6] pt-4">
                        <h3 className="font-bold text-[#2B2B2B] mb-3">Productos</h3>
                        <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-[#2B2B2B]">
                                        {item.nombre_historico} x{item.cantidad}
                                    </span>
                                    <span className="font-semibold text-[#2B2B2B]">
                                        Q{(item.precio_historico * item.cantidad).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F5EFE6]">
                            <span className="font-bold text-[#2B2B2B]">Total</span>
                            <span className="font-extrabold text-[#E67E22] text-lg">Q{order.total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
