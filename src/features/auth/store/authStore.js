import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

import {
    login as loginRequest
} from "../../../shared/api";

import { syncUser, getMe } from "../../../shared/api/user";


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

            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    expiresAt: null,
                    isAuthenticated: false,
                    isLoadingAuth: false,
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

                    try {
                        await Promise.race([
                            syncUser(),
                            new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('sync_timeout')), 5000)
                            )
                        ]);
                    } catch {
                        get().logout();
                        toast.error("Tu cuenta no está configurada. Contacta soporte.");
                        return { success: false, error: "Sync failed" };
                    }

                    toast.success("Bienvenido a Bite & Go");
                    return { success: true };

                } catch (err) {
                    const errorMessage = err.response?.data?.message || "Error al iniciar sesión";
                    set({ error: errorMessage, loading: false });
                    toast.error(errorMessage);
                    return { success: false, error: errorMessage };
                }
            },

            syncSession: async () => {
                const token = get().token;
                if (!token) {
                    set({ isLoadingAuth: false });
                    return;
                }
                try {
                    await Promise.race([
                        syncUser(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('sync_timeout')), 5000)
                        )
                    ]);
                } catch {
                    get().logout();
                    toast.error("Sesión expirada. Inicia sesión de nuevo.");
                } finally {
                    set({ isLoadingAuth: false });
                }
            },

            verifySession: async () => {
                const token = get().token;
                const isAuth = get().isAuthenticated;
                if (!token || !isAuth) return;
                try {
                    await getMe();
                } catch {
                    get().logout();
                    toast.error("Tu cuenta ya no existe. Inicia sesión de nuevo.");
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
