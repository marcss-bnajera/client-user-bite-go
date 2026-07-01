import { toast } from "react-hot-toast";
import { Trash2, PowerOff } from "lucide-react";

export function showConfirmToast({ title, message, type = "deactivate", onConfirm }) {
    const config = {
        deactivate: {
            icon: <PowerOff size={20} className="text-[#E67E22]" />,
            confirmLabel: "Desactivar",
            confirmClass: "bg-[#E67E22] hover:bg-[#D35400]",
        },
        delete: {
            icon: <Trash2 size={20} className="text-[#C0392B]" />,
            confirmLabel: "Eliminar",
            confirmClass: "bg-[#C0392B] hover:bg-[#A93226]",
        },
        activate: {
            icon: <PowerOff size={20} className="text-[#0F6E56]" />,
            confirmLabel: "Reactivar",
            confirmClass: "bg-[#0F6E56] hover:bg-[#0a5240]",
        },
    };

    const { icon, confirmLabel, confirmClass } = config[type] ?? config.deactivate;

    toast.custom((t) => (
        <div className={`bg-white rounded-2xl shadow-2xl border border-[#E8D8C3] w-80 p-5 transition-all ${t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#F5EFE6] flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="font-extrabold text-[#2B2B2B] text-base">{title}</h3>
                    <p className="text-sm text-[#6B6B6B] mt-1">{message}</p>
                </div>
            </div>
            <div className="flex gap-3 mt-5">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-1 px-4 py-2 rounded-xl border border-[#E8D8C3] text-sm font-semibold text-[#6B6B6B] hover:bg-[#F5EFE6] transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => { onConfirm?.(); toast.dismiss(t.id); }}
                    className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-bold transition-colors ${confirmClass}`}
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    ), { duration: Infinity });
}
