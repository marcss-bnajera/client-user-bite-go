import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../../../shared/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState(() => {
        return searchParams.get("token") ? "loading" : "error";
    });

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) return;

        verifyEmail(token)
            .then(() => setStatus("success"))
            .catch(() => setStatus("error"));
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-[#E8D8C3] p-8 max-w-md w-full text-center">
                {status === "loading" && (
                    <>
                        <Loader2 size={48} className="text-[#E67E22] mx-auto mb-4 animate-spin" />
                        <h2 className="text-xl font-bold text-[#2B2B2B] mb-2">Verificando tu correo</h2>
                        <p className="text-[#6B6B6B] text-sm">Espera un momento...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={40} className="text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-[#2B2B2B] mb-2">Correo verificado</h2>
                        <p className="text-[#6B6B6B] text-sm mb-6">
                            Tu cuenta está activa. Ya puedes iniciar sesión en Bite&amp;Go.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block bg-[#E67E22] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D35400] transition-colors"
                        >
                            Iniciar Sesión
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-[#2B2B2B] mb-2">No se pudo verificar</h2>
                        <p className="text-[#6B6B6B] text-sm mb-6">
                            El enlace no es válido o ya expiró. Solicita uno nuevo desde el login.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block bg-[#E67E22] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D35400] transition-colors"
                        >
                            Ir al Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};
