import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export const LoginForm = ({ onSwitch, onForgotPassword }) => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        const res = await login(data.emailOrUsername, data.password);
        if (res?.success) {
            navigate("/");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Email o Usuario
                </label>
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="text"
                    placeholder="correo@ejemplo.com o usuario"
                    {...register("emailOrUsername", {
                        required: "Este campo es obligatorio"
                    })}
                />
                {errors.emailOrUsername && (
                    <p className="text-red-500 text-xs mt-1">{errors.emailOrUsername.message}</p>
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
                        placeholder="••••••••"
                        {...register("password", {
                            required: "La contraseña es obligatoria"
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

            <div className="text-right">
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-[#E67E22] hover:underline font-semibold"
                >
                    ¿Olvidaste tu contraseña?
                </button>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? "Iniciando..." : "Iniciar Sesión"}
            </button>

            <div className="text-center text-sm">
                <span className="text-gray-500">¿No tienes cuenta? </span>
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-[#E67E22] hover:underline font-semibold"
                >
                    Regístrate aquí
                </button>
            </div>
        </form>
    );
};
