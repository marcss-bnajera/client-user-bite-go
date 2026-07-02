import { useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import ByteGoLogo from "../../../assets/img/Bite&GoLogo.png";

const AuthPage = () => {
    const [isRegister, setIsRegister] = useState(false);

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
                        {isRegister ? "Crear Cuenta" : "Bienvenido"}
                    </h1>
                    <div className="h-1.5 w-16 bg-[#FF6F00] mx-auto mt-1"></div>
                    <p className="text-gray-500 text-sm mt-3">
                        {isRegister
                            ? "Regístrate para ordenar en tus restaurantes favoritos"
                            : "Inicia sesión para disfrutar de Bite & Go"}
                    </p>
                </div>

                <div className="transition-all duration-300">
                    {isRegister ? (
                        <RegisterForm onSwitch={() => setIsRegister(false)} />
                    ) : (
                        <LoginForm onSwitch={() => setIsRegister(true)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export { AuthPage };
