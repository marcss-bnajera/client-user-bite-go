import { AppRoutes } from "./router/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
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
