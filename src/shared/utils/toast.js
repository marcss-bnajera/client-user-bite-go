import { toast } from "react-hot-toast";

const baseStyle = {
    borderRadius: "8px",
    fontWeight: 600,
    fontFamily: "inherit",
    fontSize: "1rem",
    padding: "16px 24px",
    boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)"
};

export const showSuccess = (message) =>
    toast.success(message, {
        style: {
            ...baseStyle,
            background: "linear-gradient(90deg, #27ae60 0%, #1e8449 100%)",
            color: "#fff",
            border: "2px solid #27ae60",
        },
        iconTheme: { primary: "#fff", secondary: "#27ae60" },
    });

export const showError = (message) =>
    toast.error(message, {
        style: {
            ...baseStyle,
            background: "linear-gradient(90deg, #C0392B 0%, #A93226 100%)",
            color: "#fff",
            border: "2px solid #C0392B",
        },
        iconTheme: { primary: "#fff", secondary: "#C0392B" },
    });

export const showInfo = (message) =>
    toast(message, {
        style: {
            ...baseStyle,
            background: "linear-gradient(90deg, #E67E22 0%, #D35400 100%)",
            color: "#fff",
            border: "2px solid #E67E22",
        },
        iconTheme: { primary: "#fff", secondary: "#E67E22" },
    });
