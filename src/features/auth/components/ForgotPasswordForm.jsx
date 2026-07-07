import { useState } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { ArrowLeft } from "lucide-react";

export const ForgotPasswordForm = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await forgotPassword(data.email);
            setSent(true);
            showSuccess("Correo de recuperación enviado");
        } catch (err) {
            showError(err.response?.data?.message || "Error al enviar correo");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="text-center space-y-4">
                <p className="text-[#6B6B6B] text-sm">
                    Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
                </p>
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-[#E67E22] hover:underline font-semibold text-sm"
                >
                    <ArrowLeft size={16} />
                    Volver al inicio de sesión
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <p className="text-[#6B6B6B] text-sm text-center">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Correo electrónico
                </label>
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...register("email", {
                        required: "El correo es obligatorio",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Correo no válido"
                        }
                    })}
                />
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-[#E67E22] hover:underline font-semibold text-sm"
                >
                    <ArrowLeft size={16} />
                    Volver al inicio de sesión
                </button>
            </div>
        </form>
    );
};
