import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { resetPassword } from "../../../shared/api";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState(token ? "form" : "error");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await resetPassword(token, data.newPassword);
            setStatus("success");
        } catch {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-[#E8D8C3] p-8 max-w-md w-full">
                {status === "form" && (
                    <>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-[#2B2B2B]">Restablecer Contraseña</h1>
                            <div className="h-1 w-12 bg-[#E67E22] mx-auto mt-2"></div>
                            <p className="text-[#6B6B6B] text-sm mt-3">
                                Ingresa tu nueva contraseña
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none pr-10"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mínimo 8 caracteres"
                                        {...register("newPassword", {
                                            required: "La contraseña es obligatoria",
                                            minLength: {
                                                value: 8,
                                                message: "Mínimo 8 caracteres"
                                            }
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                    Confirmar contraseña
                                </label>
                                <input
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                                    type="password"
                                    placeholder="Repite la contraseña"
                                    {...register("confirmPassword", {
                                        required: "Confirma tu contraseña",
                                        validate: (val) =>
                                            val === watch("newPassword") || "Las contraseñas no coinciden"
                                    })}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? "Restableciendo..." : "Restablecer Contraseña"}
                            </button>
                        </form>
                    </>
                )}

                {status === "loading" && (
                    <div className="text-center">
                        <Loader2 size={48} className="text-[#E67E22] mx-auto mb-4 animate-spin" />
                        <h2 className="text-xl font-bold text-[#2B2B2B] mb-2">Restableciendo contraseña</h2>
                        <p className="text-[#6B6B6B] text-sm">Espera un momento...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={40} className="text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-[#2B2B2B] mb-2">Contraseña actualizada</h2>
                        <p className="text-[#6B6B6B] text-sm mb-6">
                            Tu contraseña se ha restablecido exitosamente. Ya puedes iniciar sesión.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block bg-[#E67E22] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D35400] transition-colors"
                        >
                            Iniciar Sesión
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-[#2B2B2B] mb-2">Enlace inválido o expirado</h2>
                        <p className="text-[#6B6B6B] text-sm mb-6">
                            El enlace para restablecer tu contraseña no es válido o ya expiró. Solicita uno nuevo.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block bg-[#E67E22] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D35400] transition-colors"
                        >
                            Ir al Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
