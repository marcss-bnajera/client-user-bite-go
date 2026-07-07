import { useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import ByteGoLogo from "../../../assets/img/Bite&GoLogo.png";

const AuthPage = () => {
    const [view, setView] = useState("login");

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-lg">
                <div className="flex justify-center mb-2">
                    <img
                        src={ByteGoLogo}
                        alt="Bite & Go Logo"
                        className="h-17 w-auto object-contain"
                    />
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
                        {view === "register" ? "Crear Cuenta" : view === "forgot" ? "Recuperar Contraseña" : "Bienvenido"}
                    </h1>
                    <div className="h-1.5 w-16 bg-[#FF6F00] mx-auto mt-1"></div>
                    <p className="text-gray-500 text-sm mt-3">
                        {view === "register"
                            ? "Regístrate para ordenar en tus restaurantes favoritos"
                            : view === "forgot"
                            ? "Ingresa tu correo para recuperar tu contraseña"
                            : "Inicia sesión para disfrutar de Bite & Go"}
                    </p>
                </div>

                <div className="transition-all duration-300">
                    {view === "register" ? (
                        <RegisterForm onSwitch={() => setView("login")} />
                    ) : view === "forgot" ? (
                        <ForgotPasswordForm onBack={() => setView("login")} />
                    ) : (
                        <LoginForm
                            onSwitch={() => setView("register")}
                            onForgotPassword={() => setView("forgot")}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export { AuthPage };
