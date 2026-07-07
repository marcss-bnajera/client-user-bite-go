import { useState, useEffect, useRef } from "react";
import { getProfile, uploadProfilePhoto, deleteProfilePhoto } from "../../../shared/api";
import { useAuthStore } from "../../auth/store/authStore";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { User, Phone, AtSign, Camera, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";

export const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imgFailed, setImgFailed] = useState(false);
    const fileInputRef = useRef(null);
    const user = useAuthStore((s) => s.user);

    const { register, handleSubmit, reset } = useForm();

    const isValidCloudinaryUrl = (url) =>
        url && url.trim() !== "" && url.includes("res.cloudinary.com") && !url.includes("default-avatar");

    const avatarSrc = isValidCloudinaryUrl(user?.profilePicture)
        ? user.profilePicture
        : isValidCloudinaryUrl(profile?.profilePicture)
            ? profile.profilePicture
            : null;
    const showAvatar = avatarSrc && !imgFailed;

    useEffect(() => { setImgFailed(false); }, [avatarSrc]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getProfile();
                const p = data.data;
                setProfile(p);
                reset({
                    nombre: p.name || "",
                    apellido: p.surname || "",
                    username: p.username || "",
                    email: p.email || "",
                    telefono: p.phone || "",
                });
            } catch (err) {
                console.error("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [reset]);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/avif"];
        if (!allowed.includes(file.type)) {
            showError("Formato no válido. Usa JPG, PNG o WebP");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError("La imagen no puede superar 5 MB");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("foto", file);

            const { data } = await uploadProfilePhoto(formData);

            if (data.success) {
                setProfile((prev) => ({ ...prev, profilePicture: data.foto_url }));
                useAuthStore.setState((state) => ({
                    user: { ...state.user, profilePicture: data.foto_url },
                }));
                showSuccess("Foto de perfil actualizada");
            }
        } catch (err) {
            showError(err.response?.data?.message || "Error al subir la imagen");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onSubmit = async () => {
        showSuccess("Perfil actualizado");
    };

    const handleDeletePhoto = async (e) => {
        e.stopPropagation();
        try {
            const { data } = await deleteProfilePhoto();
            if (data.success) {
                setProfile((prev) => ({ ...prev, profilePicture: "" }));
                useAuthStore.setState((state) => ({
                    user: { ...state.user, profilePicture: "" },
                }));
                showSuccess("Foto de perfil eliminada");
            }
        } catch (err) {
            showError(err.response?.data?.message || "Error al eliminar la imagen");
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
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp,image/avif"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <div className="relative w-20 h-20 mx-auto mb-3">
                            <div
                                onClick={handlePhotoClick}
                                className="w-20 h-20 rounded-full bg-[#F5EFE6] flex items-center justify-center overflow-hidden cursor-pointer group"
                            >
                                {showAvatar ? (
                                    <img src={avatarSrc} alt={profile?.username} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
                                ) : (
                                    <User size={32} className="text-[#E67E22]" />
                                )}
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {uploading ? (
                                        <Loader2 size={20} className="text-white animate-spin" />
                                    ) : (
                                        <>
                                            <Camera size={18} className="text-white" />
                                            {showAvatar && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePhoto(e); }}
                                                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-red-500/80 flex items-center justify-center transition-colors"
                                                    title="Eliminar foto"
                                                >
                                                    <X size={14} className="text-white" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="font-bold text-[#2B2B2B]">@{profile?.username}</p>
                        <p className="text-sm text-[#6B6B6B]">{profile?.email}</p>
                        <span className="inline-block mt-1 px-3 py-1 bg-[#F5EFE6] text-[#E67E22] text-xs font-semibold rounded-full">
                            {profile?.role}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                    <User size={14} className="inline mr-1" />
                                    Nombre
                                </label>
                                <input
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                    {...register("nombre")}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                    <User size={14} className="inline mr-1" />
                                    Apellido
                                </label>
                                <input
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                    {...register("apellido")}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                <AtSign size={14} className="inline mr-1" />
                                Usuario
                            </label>
                            <input
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                {...register("username")}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                Correo electrónico
                            </label>
                            <input
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                {...register("email")}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                <Phone size={14} className="inline mr-1" />
                                Teléfono
                            </label>
                            <input
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                {...register("telefono")}
                                readOnly
                            />
                        </div>

                        <p className="text-xs text-[#6B6B6B] text-center">
                            Los datos del perfil se gestionan desde el servicio de autenticación.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
