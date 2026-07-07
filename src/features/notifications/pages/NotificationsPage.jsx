import { useState, useEffect, useRef, useCallback } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { Bell, Check, CheckCheck, ShoppingBag, CalendarDays, Megaphone, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";

const tipoConfig = {
    pedido: { icon: ShoppingBag, color: "text-[#E67E22]", bg: "bg-orange-50" },
    reservacion: { icon: CalendarDays, color: "text-blue-500", bg: "bg-blue-50" },
    promocion: { icon: Megaphone, color: "text-[#A8D5BA]", bg: "bg-green-50" },
    sistema: { icon: Info, color: "text-[#6B6B6B]", bg: "bg-gray-50" },
};

export const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const mountedRef = useRef(true);

    const fetchNotifications = useCallback(async (p = 1, silent = false) => {
        try {
            if (!silent) setLoading(true);
            const { data } = await getNotifications({ page: p, limit: 20 });
            if (mountedRef.current) {
                setNotifications(data.notifications || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch {
            // silencioso en polling
        } finally {
            if (mountedRef.current && !silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchNotifications(page, false);
        return () => { mountedRef.current = false; };
    }, [fetchNotifications, page]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") fetchNotifications(page, true);
        }, 8000);
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchNotifications, page]);

    const handleMarkAsRead = async (notif) => {
        if (notif.leido) return;
        try {
            await markNotificationAsRead(notif._id);
            setNotifications(prev =>
                prev.map(n => n._id === notif._id ? { ...n, leido: true } : n)
            );
            if (notif.id_pedido) {
                navigate(`/orders/${notif.id_pedido}`);
            }
        } catch {
            showError("Error al marcar notificación");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
            showSuccess("Todas marcadas como leídas");
        } catch {
            showError("Error al marcar notificaciones");
        }
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Ahora";
        if (mins < 60) return `Hace ${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `Hace ${hrs}h`;
        const days = Math.floor(hrs / 24);
        return `Hace ${days}d`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Bell size={24} className="text-[#E67E22]" />
                        <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Notificaciones</h1>
                    </div>
                    {notifications.some(n => !n.leido) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 text-sm font-semibold text-[#E67E22] hover:text-[#D35400] transition-colors"
                        >
                            <CheckCheck size={16} />
                            Marcar todo leído
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-[#E8D8C3] p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20">
                        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No tienes notificaciones</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {notifications.map((notif) => {
                                const config = tipoConfig[notif.tipo] || tipoConfig.sistema;
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={notif._id}
                                        onClick={() => handleMarkAsRead(notif)}
                                        className={`w-full text-left bg-white rounded-xl border p-4 flex gap-3 transition-all hover:shadow-sm ${
                                            notif.leido
                                                ? "border-[#E8D8C3] opacity-70"
                                                : "border-[#E67E22] ring-1 ring-[#E67E22]/20"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                                            <Icon size={18} className={config.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`text-sm font-bold ${notif.leido ? "text-[#6B6B6B]" : "text-[#2B2B2B]"}`}>
                                                    {notif.titulo}
                                                </h3>
                                                {!notif.leido && (
                                                    <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#6B6B6B] mt-0.5">{notif.mensaje}</p>
                                            <p className="text-[10px] text-[#A0A0A0] mt-1">{timeAgo(notif.createdAt)}</p>
                                        </div>
                                        {notif.leido && (
                                            <Check size={14} className="text-[#A8D5BA] shrink-0 mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

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
                    </>
                )}
            </div>
        </div>
    );
};
