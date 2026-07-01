import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

import {
    login as loginRequest
} from "../../../shared/api";


export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            loading: false,
            error: null,
            isLoadingAuth: true,
            isAuthenticated: false,

            checkAuth: () => {
                const token = get().token;
                const role = get().user?.role;
                const clientRoles = ["Cliente"];
                const isClient = clientRoles.includes(role);

                if (token && !isClient) {
                    set({
                        user: null,
                        token: null,
                        refreshToken: null,
                        expiresAt: null,
                        isAuthenticated: false,
                        isLoadingAuth: false,
                        error: "No tienes permiso para acceder como cliente"
                    })
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    expiresAt: null,
                    isAuthenticated: false,
                })
            },

            login: async (emailOrUsername, password) => {
                try {
                    set({ loading: true, error: null });

                    const payload = {
                        EmailOrUsername: emailOrUsername,
                        Password: password
                    };

                    const { data } = await loginRequest(payload);

                    const role = data?.userDetails?.role;
                    const clientRoles = ["Cliente"];

                    if (!clientRoles.includes(role)) {
                        set({ loading: false, error: "No tienes permiso para acceder como cliente" });
                        toast.error("No tienes permiso para acceder como cliente");
                        return { success: false };
                    }

                    set({
                        token: data.token,
                        user: {
                            id: data.userDetails.id,
                            username: data.userDetails.username,
                            profilePicture: data.userDetails.profilePicture,
                            role: data.userDetails.role,
                        },
                        expiresAt: data.expiresAt,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                    });

                    toast.success("Bienvenido a Bite & Go");
                    return { success: true };

                } catch (err) {
                    const errorMessage = err.response?.data?.message || "Error al iniciar sesión";
                    set({ error: errorMessage, loading: false });
                    toast.error(errorMessage);
                    return { success: false, error: errorMessage };
                }
            },
        }),
        {
            name: "auth-store-user",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                expiresAt: state.expiresAt,
                isAuthenticated: state.isAuthenticated,
            })
        }
    )
);
