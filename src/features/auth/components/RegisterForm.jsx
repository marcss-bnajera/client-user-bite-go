import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerUser } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";

export const RegisterForm = ({ onSwitch }) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const payload = {
                nombre: data.nombre,
                email: data.email,
                password: data.password,
                telefono: data.telefono || undefined,
                direccion: data.direccion || undefined,
            };
            await registerUser(payload);
            showSuccess("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
            onSwitch();
        } catch (err) {
            const msg = err.response?.data?.message || "Error al registrar";
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Nombre completo
                </label>
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="text"
                    placeholder="Tu nombre"
                    {...register("nombre", {
                        required: "El nombre es obligatorio"
                    })}
                />
                {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                )}
            </div>

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

            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Contraseña
                </label>
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: {
                            value: 8,
                            message: "Mínimo 8 caracteres"
                        }
                    })}
                />
                {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Teléfono <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="tel"
                    placeholder="Tu teléfono"
                    {...register("telefono")}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Dirección <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="text"
                    placeholder="Tu dirección"
                    {...register("direccion")}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>

            <div className="text-center text-sm">
                <span className="text-gray-500">¿Ya tienes cuenta? </span>
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-[#E67E22] hover:underline font-semibold"
                >
                    Inicia sesión
                </button>
            </div>
        </form>
    );
};
