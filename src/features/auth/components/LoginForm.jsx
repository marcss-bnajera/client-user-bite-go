import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";

export const LoginForm = ({ onSwitch }) => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);

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
                <input
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none"
                    type="password"
                    placeholder="••••••••"
                    {...register("password", {
                        required: "La contraseña es obligatoria"
                    })}
                />
                {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
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
