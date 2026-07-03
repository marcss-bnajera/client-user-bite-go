import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMyOrders } from "../../../shared/api";
import { ArrowLeft } from "lucide-react";

export const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await getMyOrders({ page: 1, limit: 100 });
                const found = data.orders?.find((o) => o._id === id);
                setOrder(found || null);
            } catch (err) {
                console.error("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

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
