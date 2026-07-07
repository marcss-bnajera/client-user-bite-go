import { useEffect } from "react";
import { AppRoutes } from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../features/auth/store/authStore";
import imgLogo from "../assets/img/LogoBiteGoPequeño.png";

function App() {
    const syncSession = useAuthStore((state) => state.syncSession);
    const verifySession = useAuthStore((state) => state.verifySession);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

    useEffect(() => {
        if (isAuthenticated) {
            syncSession();
        } else {
            useAuthStore.setState({ isLoadingAuth: false });
        }
    }, []);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                verifySession();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    if (isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F5EFE6] z-[9999]">
                <img
                    src={imgLogo}
                    alt="Bite & Go"
                    className="h-16 w-auto animate-pulse"
                />
                <div className="mt-6 w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        fontFamily: "Inherit",
                        fontWeight: 600,
                        fontSize: "1rem",
                        borderRadius: "8px",
                    }
                }}
            />
            <AppRoutes />
        </>
    );
}

export default App;
