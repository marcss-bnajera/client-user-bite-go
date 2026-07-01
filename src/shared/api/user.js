import { axiosUser } from "./api";

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

// ================= REVIEWS =================
export const getMyReviews = async () => {
    return await axiosUser.get("/reviewsRatings");
};
export const getRestaurantReviews = async (id_restaurante) => {
    return await axiosUser.get(`/reviewsRatings/restaurant/${id_restaurante}`);
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

// ================= GASTRONOMIC EVENTS =================
export const getEventsByRestaurant = async (id) => {
    return await axiosUser.get(`/gastronomicEvents/${id}`);
};
