import { useState, useEffect } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { updateUser, getUserById } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { User, Phone, MapPin, Save } from "lucide-react";
import { useForm } from "react-hook-form";

export const ProfilePage = () => {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (user?.id) {
                    const { data } = await getUserById(user.id);
                    setProfile(data.user);
                    reset({
                        nombre: data.user.nombre,
                        telefono: data.user.telefono || "",
                        direccion: data.user.direccion || "",
                    });
                }
            } catch (err) {
                console.error("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.id, reset]);

    const onSubmit = async (data) => {
        try {
            setSaving(true);
            await updateUser(user.id, {
                nombre: data.nombre,
                telefono: data.telefono,
                direccion: data.direccion,
            });
            showSuccess("Perfil actualizado");
        } catch (err) {
            showError(err.response?.data?.message || "Error al actualizar");
        } finally {
            setSaving(false);
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
                <div className="flex items-center gap-3 mb-6">
                    <User size={24} className="text-[#E67E22]" />
                    <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Mi Perfil</h1>
                </div>

                <div className="bg-white rounded-xl border border-[#E8D8C3] p-6">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-[#F5EFE6] flex items-center justify-center mx-auto mb-3">
                            <User size={32} className="text-[#E67E22]" />
                        </div>
                        <p className="text-sm text-[#6B6B6B]">{profile?.email}</p>
                        <span className="inline-block mt-1 px-3 py-1 bg-[#F5EFE6] text-[#E67E22] text-xs font-semibold rounded-full">
                            {profile?.rol}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                <User size={14} className="inline mr-1" />
                                Nombre
                            </label>
                            <input
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                <Phone size={14} className="inline mr-1" />
                                Teléfono
                            </label>
                            <input
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                {...register("telefono")}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                <MapPin size={14} className="inline mr-1" />
                                Dirección
                            </label>
                            <input
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                {...register("direccion")}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
