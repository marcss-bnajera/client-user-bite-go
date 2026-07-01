import { axiosAuth } from "./api";

export const login = async (data) => {
    return await axiosAuth.post("/api/v1/Auth/login", data);
};

export const register = async (data) => {
    return await axiosAuth.post("/api/v1/Auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const forgotPassword = async (email) => {
    return await axiosAuth.post("/api/v1/Auth/forgot-password", { email });
};

export const resetPassword = async (token, newPassword) => {
    return await axiosAuth.post("/api/v1/Auth/reset-password", { token, newPassword });
};

export const verifyEmail = async (token) => {
    return await axiosAuth.post("/api/v1/Auth/verify-email", { token });
};
