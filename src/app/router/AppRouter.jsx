import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { UserLayout } from "../layouts/UserLayout.jsx";
import { RestaurantsPage } from "../../features/restaurants/pages/RestaurantsPage.jsx";
import { RestaurantDetailPage } from "../../features/restaurants/pages/RestaurantDetailPage.jsx";
import { MenuPage } from "../../features/products/pages/MenuPage.jsx";
import { OrdersPage } from "../../features/orders/pages/OrdersPage.jsx";
import { OrderDetailPage } from "../../features/orders/pages/OrderDetailPage.jsx";
import { ReservationsPage } from "../../features/reservations/pages/ReservationsPage.jsx";
import { ReviewsPage } from "../../features/reviews/pages/ReviewsPage.jsx";
import { ProfilePage } from "../../features/profile/pages/ProfilePage.jsx";
import { useAuthStore } from "../../features/auth/store/authStore";

export const AppRoutes = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <Routes>
            {/* PUBLIC - raíz lleva a login */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/restaurants" replace />} />

            {/* PROTECTED */}
            <Route element={isAuthenticated ? <UserLayout /> : <Navigate to="/auth" replace />}>
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                <Route path="/restaurants/:id/menu" element={<MenuPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/reservations" element={<ReservationsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* NOT FOUND */}
            <Route path="*" element={<h1 className="text-center mt-20 text-2xl font-bold text-gray-600">Página no encontrada</h1>} />
        </Routes>
    );
}
