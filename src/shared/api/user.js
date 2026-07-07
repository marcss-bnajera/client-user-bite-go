import { axiosUser } from "./api";

// ================= SYNC =================
export const syncUser = async (data) => {
    return await axiosUser.post("/users/sync", data);
};

export const getMe = async () => {
    return await axiosUser.get("/users/me");
};

// ================= RESTAURANTS =================
export const getRestaurants = async (params) => {
    return await axiosUser.get("/restaurants", { params });
};
export const getRestaurantById = async (id) => {
    return await axiosUser.get(`/restaurants/${id}`);
};

// ================= PRODUCTS =================
export const getProducts = async (params) => {
    return await axiosUser.get("/products", { params });
};
export const getMenuByRestaurant = async (id_restaurante) => {
    return await axiosUser.get(`/products/menu/${id_restaurante}`);
};
export const searchProducts = async (q) => {
    return await axiosUser.get("/products/search", { params: { q } });
};
export const getProductsByRestaurant = async (id_restaurante, params) => {
    return await axiosUser.get(`/products/restaurant/${id_restaurante}`, { params });
};
export const getProductById = async (id) => {
    return await axiosUser.get(`/products/${id}`);
};

// ================= CATEGORIES =================
export const getCategoriesByRestaurant = async (id_restaurante) => {
    return await axiosUser.get("/categories", { params: { restaurante: id_restaurante } });
};

// ================= ORDERS =================
export const getMyOrders = async (params) => {
    return await axiosUser.get("/orders/history", { params });
};
export const getOrderById = async (id) => {
    return await axiosUser.get(`/orders/${id}`);
};
export const createOrder = async (data) => {
    return await axiosUser.post("/orders", data);
};
export const cancelOrder = async (id) => {
    return await axiosUser.delete(`/orders/${id}`);
};

// ================= ITEMS =================
export const getItemsByOrder = async (id_order) => {
    return await axiosUser.get(`/items/${id_order}`);
};
export const addItemToOrder = async (id_order, data) => {
    return await axiosUser.post(`/items/add/${id_order}`, data);
};
export const updateItemInOrder = async (id_order, id_item, data) => {
    return await axiosUser.put(`/items/${id_order}/${id_item}`, data);
};
export const deleteItemFromOrder = async (id_order, id_item) => {
    return await axiosUser.delete(`/items/${id_order}/${id_item}`);
};

// ================= RESERVATIONS =================
export const getMyReservations = async () => {
    return await axiosUser.get("/reservations");
};
export const createReservation = async (data) => {
    return await axiosUser.post("/reservations", data);
};
export const cancelReservation = async (id) => {
    return await axiosUser.delete(`/reservations/${id}`);
};
export const getTablesAvailability = async (params) => {
    return await axiosUser.get("/reservations/tables-availability", { params });
};

// ================= REVIEWS =================
export const getMyReviews = async () => {
    return await axiosUser.get("/reviewsRatings");
};
export const getRestaurantReviews = async (id_restaurante, params) => {
    return await axiosUser.get(`/reviewsRatings/restaurant/${id_restaurante}`, { params });
};
export const getEligibleForReview = async (id_restaurante, params) => {
    return await axiosUser.get(`/reviewsRatings/eligible/${id_restaurante}`, { params });
};
export const createReview = async (data) => {
    return await axiosUser.post("/reviewsRatings", data);
};

// ================= USERS =================
export const registerUser = async (data) => {
    return await axiosUser.post("/users/register", data);
};
export const updateUser = async (id, data) => {
    return await axiosUser.put(`/users/${id}`, data);
};
export const getUserById = async (id) => {
    return await axiosUser.get(`/users/${id}`);
};
export const uploadProfilePhoto = async (formData) => {
    return await axiosUser.put("/users/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
export const deleteProfilePhoto = async () => {
    return await axiosUser.delete("/users/profile/photo");
};

// ================= GASTRONOMIC EVENTS =================
export const getEventsByRestaurant = async (id) => {
    return await axiosUser.get(`/gastronomicEvents/${id}`);
};

// ================= FAVORITES =================
export const getFavorites = async () => {
    return await axiosUser.get("/users/favorites/list");
};
export const toggleFavorite = async (id_restaurante) => {
    return await axiosUser.post("/users/favorites/toggle", { id_restaurante });
};

// ================= ADDRESSES =================
export const getAddresses = async () => {
    return await axiosUser.get("/users/addresses/list");
};
export const addAddress = async (data) => {
    return await axiosUser.post("/users/addresses/add", data);
};
export const deleteAddress = async (id) => {
    return await axiosUser.delete(`/users/addresses/${id}`);
};

// ================= COUPONS =================
export const validateCoupon = async (codigo, monto_total) => {
    return await axiosUser.post("/coupons/validate", { codigo, monto_total });
};

// ================= NOTIFICATIONS =================
export const getNotifications = async (params) => {
    return await axiosUser.get("/notifications", { params });
};
export const getUnreadCount = async () => {
    return await axiosUser.get("/notifications/unread-count");
};
export const markNotificationAsRead = async (id) => {
    return await axiosUser.put(`/notifications/${id}/read`);
};
export const markAllNotificationsAsRead = async () => {
    return await axiosUser.put("/notifications/read-all");
};
