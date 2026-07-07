import { useState, useEffect } from "react";
import { getAddresses, addAddress, deleteAddress } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { MapPin, Trash2, Plus, Home, Briefcase, Star } from "lucide-react";

const iconMap = { Casa: Home, Trabajo: Briefcase };

export const AddressesPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [etiqueta, setEtiqueta] = useState("Casa");
    const [direccion, setDireccion] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const { data } = await getAddresses();
                setAddresses(data.direcciones || []);
            } catch {
                showError("Error al cargar direcciones");
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!direccion.trim()) { showError("Ingresa una dirección"); return; }
        try {
            setSaving(true);
            const predeterminada = addresses.length === 0;
            const { data } = await addAddress({ etiqueta, direccion: direccion.trim(), predeterminada });
            setAddresses(data.direcciones);
            setDireccion("");
            setShowForm(false);
            showSuccess("Dirección agregada");
        } catch (err) {
            showError(err.response?.data?.message || "Error al agregar dirección");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await deleteAddress(id);
            setAddresses(data.direcciones);
            showSuccess("Dirección eliminada");
        } catch {
            showError("Error al eliminar dirección");
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
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <MapPin size={24} className="text-[#E67E22]" />
                        <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Mis Direcciones</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-1 bg-[#E67E22] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#D35400] transition-colors"
                    >
                        <Plus size={16} />
                        Agregar
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleAdd} className="bg-white rounded-xl border border-[#E8D8C3] p-4 mb-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Etiqueta</label>
                            <div className="flex gap-2">
                                {["Casa", "Trabajo", "Otro"].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setEtiqueta(opt)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                            etiqueta === opt
                                                ? "bg-[#E67E22] text-white"
                                                : "bg-[#F5EFE6] text-[#6B6B6B] hover:bg-[#E8D8C3]"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Dirección</label>
                            <input
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Calle, colonia, referencias..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[#E67E22] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#D35400] transition-colors disabled:opacity-60"
                            >
                                {saving ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#6B6B6B] hover:bg-[#F5EFE6] transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                {addresses.length === 0 ? (
                    <div className="text-center py-20">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Aún no tienes direcciones guardadas</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {addresses.map((addr) => {
                            const Icon = iconMap[addr.etiqueta] || MapPin;
                            return (
                                <div key={addr._id} className="bg-white rounded-xl border border-[#E8D8C3] p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#F5EFE6] flex items-center justify-center shrink-0">
                                        <Icon size={18} className="text-[#E67E22]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#2B2B2B] text-sm">{addr.etiqueta}</span>
                                            {addr.predeterminada && (
                                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#E67E22] bg-[#F5EFE6] px-1.5 py-0.5 rounded-full">
                                                    <Star size={8} className="fill-[#E67E22]" /> Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#6B6B6B] truncate">{addr.direccion}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(addr._id)}
                                        className="p-2 rounded-lg text-[#6B6B6B] hover:text-[#C0392B] hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
