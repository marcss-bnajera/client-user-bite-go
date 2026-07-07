import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../features/auth/store/authStore';

const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL,
    timeout: 8000,
    headers: {
        "Content-Type": "application/json"
    }
});

const axiosUser = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 8000,
    headers: {
        "Content-Type": "application/json"
    }
});

axiosAuth.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosUser.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let rateLimitToastShown = false;

const handleAuthError = (_error) => {
    const status = _error.response?.status;
    if (status === 401) {
        const currentPath = window.location.pathname;
        if (currentPath !== "/auth") {
            useAuthStore.getState().logout();
        }
    }
    if (status === 429) {
        if (!rateLimitToastShown) {
            rateLimitToastShown = true;
            toast.error("Servidor saturado. Espera un momento e intenta de nuevo.");
            setTimeout(() => { rateLimitToastShown = false; }, 10000);
        }
        return Promise.resolve(undefined);
    }
    return Promise.reject(_error);
};

axiosAuth.interceptors.response.use((res) => res, handleAuthError);
axiosUser.interceptors.response.use((res) => res, handleAuthError);

export { axiosAuth, axiosUser };
