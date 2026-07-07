import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { register as registerAuth } from "../../../shared/api";
import { registerUser } from "../../../shared/api/user";
import { showSuccess, showError } from "../../../shared/utils/toast";

export const RegisterForm = ({ onSwitch }) => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("Name", data.nombre);
            formData.append("Surname", data.apellido);
            formData.append("Username", data.username);
            formData.append("Email", data.email);
            formData.append("Password", data.password);
            formData.append("Phone", data.telefono);

            await registerAuth(formData);

            try {
                await registerUser({
                    email: data.email,
                    nombre: `${data.nombre} ${data.apellido}`.trim(),
                    username: data.username,
                    telefono: data.telefono,
                });
            } catch {
                // MongoDB registration is best-effort; auth-service is the source of truth
            }

            showSuccess("Cuenta creada exitosamente. Verifica tu email para activar la cuenta.");
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
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        Nombre
                    </label>
                    <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                        type="text"
                        placeholder="Tu nombre"
                        {...register("nombre", {
                            required: "El nombre es obligatorio",
                            maxLength: { value: 25, message: "Máximo 25 caracteres" }
                        })}
                    />
                    {errors.nombre && (
                        <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        Apellido
                    </label>
                    <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                        type="text"
                        placeholder="Tu apellido"
                        {...register("apellido", {
                            required: "El apellido es obligatorio",
                            maxLength: { value: 25, message: "Máximo 25 caracteres" }
                        })}
                    />
                    {errors.apellido && (
                        <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Usuario
                </label>
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="text"
                    placeholder="tu_usuario"
                    {...register("username", {
                        required: "El usuario es obligatorio",
                        maxLength: { value: 50, message: "Máximo 50 caracteres" }
                    })}
                />
                {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
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
                    Teléfono
                </label>
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="tel"
                    placeholder="12345678"
                    {...register("telefono", {
                        required: "El teléfono es obligatorio",
                        minLength: { value: 8, message: "Debe tener exactamente 8 caracteres" },
                        maxLength: { value: 8, message: "Debe tener exactamente 8 caracteres" }
                    })}
                />
                {errors.telefono && (
                    <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none pr-10"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        {...register("password", {
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
                {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
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
