import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail } from "lucide-react";
import { register as registerAuth, resendVerification } from "../../../shared/api";
import { registerUser } from "../../../shared/api/user";
import { showError } from "../../../shared/utils/toast";

export const RegisterForm = ({ onSwitch }) => {
    const [loading, setLoading] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
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

            setRegisteredEmail(data.email);
        } catch (err) {
            const msg = err.response?.data?.message || "Error al registrar";
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            await resendVerification(registeredEmail);
        } catch {
            showError("Error al reenviar el correo");
        } finally {
            setResending(false);
            setCooldown(45);
            const interval = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    if (registeredEmail) {
        return (
            <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-[#F5EFE6] rounded-full flex items-center justify-center mx-auto">
                    <Mail size={32} className="text-[#E67E22]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#2B2B2B] mb-2">Revisa tu correo</h2>
                    <p className="text-[#6B6B6B] text-sm leading-relaxed">
                        Te enviamos un enlace de verificación a{" "}
                        <span className="font-semibold text-gray-800">{registeredEmail}</span>.
                        Haz clic en el enlace para activar tu cuenta.
                    </p>
                </div>
                <div className="bg-[#F5EFE6] rounded-lg p-4 text-sm text-[#6B6B6B]">
                    <p>¿No recibiste el correo?</p>
                    <p className="mt-1">Revisa tu carpeta de spam o solicita un nuevo enlace.</p>
                </div>
                <button
                    onClick={handleResend}
                    disabled={resending || cooldown > 0}
                    className="text-[#E67E22] hover:underline font-semibold text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {resending ? "Enviando..." : cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar correo"}
                </button>
                <button
                    onClick={onSwitch}
                    className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                    Ya lo verifiqué, iniciar sesión
                </button>
            </div>
        );
    }

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
