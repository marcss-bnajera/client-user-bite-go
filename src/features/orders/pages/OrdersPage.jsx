import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, cancelOrder } from "../../../shared/api";
import { showConfirmToast } from "../../../shared/utils/confirmToast";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { ShoppingBag, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const statusConfig = {
    Pendiente: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    Preparacion: { color: "bg-blue-100 text-blue-700", icon: Clock },
    Listo: { color: "bg-purple-100 text-purple-700", icon: CheckCircle },
    Servido: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    Entregado: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    Cancelado: { color: "bg-red-100 text-red-700", icon: XCircle },
};

export const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data } = await getMyOrders({ page, limit: 10 });
                if (!cancelled) {
                    setOrders(data.orders || []);
                    setTotalPages(data.totalPages || 1);
                }
            } catch (err) {
                console.error("Error", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchOrders();
        return () => { cancelled = true; };
    }, [page, refreshKey]);

    const handleCancel = (orderId) => {
        showConfirmToast({
            title: "Cancelar Pedido",
            message: "¿Estás seguro de que deseas cancelar este pedido?",
            type: "delete",
            onConfirm: async () => {
                try {
                    await cancelOrder(orderId);
                    showSuccess("Pedido cancelado");
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
                <div className="flex items-center gap-3 mb-6">
                    <ShoppingBag size={24} className="text-[#E67E22]" />
                    <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Mis Pedidos</h1>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-[#E8D8C3] p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No tienes pedidos aún</p>
                        <Link to="/restaurants" className="inline-block mt-4 bg-[#E67E22] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#D35400] transition-colors">
                            Explorar restaurantes
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const status = statusConfig[order.estado] || statusConfig.Pendiente;
                            const StatusIcon = status.icon;
                            return (
                                <div key={order._id} className="bg-white rounded-xl border border-[#E8D8C3] p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-[#2B2B2B]">
                                                {order.id_restaurante?.nombre || "Restaurante"}
                                            </h3>
                                            <p className="text-sm text-[#6B6B6B]">
                                                {order.items?.length} {order.items?.length === 1 ? "producto" : "productos"} • {order.tipo_servicio}
                                            </p>
                                            <p className="text-xs text-[#6B6B6B] mt-1">
                                                {new Date(order.createdAt).toLocaleDateString("es-GT", {
                                                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </p>
                                        </div>
                                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                            <StatusIcon size={12} />
                                            {order.estado}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5EFE6]">
                                        <span className="font-bold text-[#2B2B2B]">Q{order.total?.toFixed(2)}</span>
                                        <div className="flex gap-2">
                                            {order.estado === "Pendiente" && (
                                                <button
                                                    onClick={() => handleCancel(order._id)}
                                                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="flex items-center gap-1 text-xs text-[#E67E22] hover:text-[#D35400] font-semibold"
                                            >
                                                Ver detalle
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E8D8C3] disabled:opacity-40 hover:bg-[#F5EFE6]"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 text-sm font-semibold text-[#6B6B6B]">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E8D8C3] disabled:opacity-40 hover:bg-[#F5EFE6]"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
