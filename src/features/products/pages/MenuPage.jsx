import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMenuByRestaurant, getCategoriesByRestaurant, createOrder } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { ArrowLeft, Plus, Minus } from "lucide-react";

export const MenuPage = () => {
    const { id } = useParams();
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [serviceType, setServiceType] = useState("Comer aquí");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [menuRes, catRes] = await Promise.all([
                    getMenuByRestaurant(id),
                    getCategoriesByRestaurant(id),
                ]);
                setMenu(menuRes.data.menu || []);
                setCategories(catRes.data.categories || []);
            } catch (err) {
                console.error("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const filteredMenu = activeCategory
        ? menu.filter((p) => p.categoria?._id === activeCategory)
        : menu;

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id_producto === product._id);
            if (existing) {
                return prev.map((item) =>
                    item.id_producto === product._id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prev, {
                id_producto: product._id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1,
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id_producto === productId);
            if (existing && existing.cantidad > 1) {
                return prev.map((item) =>
                    item.id_producto === productId
                        ? { ...item, cantidad: item.cantidad - 1 }
                        : item
                );
            }
            return prev.filter((item) => item.id_producto !== productId);
        });
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

    const handleOrder = async () => {
        if (cart.length === 0) return;
        try {
            setOrdering(true);
            await createOrder({
                id_restaurante: id,
                tipo_servicio: serviceType,
                items: cart.map(({ id_producto, cantidad }) => ({ id_producto, cantidad })),
            });
            showSuccess("Pedido creado exitosamente");
            setCart([]);
        } catch (err) {
            showError(err.response?.data?.message || "Error al crear el pedido");
        } finally {
            setOrdering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E22]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <div className="bg-white border-b border-[#E8D8C3] sticky top-16 z-40">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link to={`/restaurants/${id}`} className="text-[#6B6B6B] hover:text-[#E67E22]">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="font-bold text-[#2B2B2B]">Menú</h2>
                </div>
                <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-thin">
                    <button
                        onClick={() => setActiveCategory("")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                            !activeCategory
                                ? "bg-[#E67E22] text-white"
                                : "bg-[#F5EFE6] text-[#6B6B6B] hover:bg-[#E8D8C3]"
                        }`}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                activeCategory === cat._id
                                    ? "bg-[#E67E22] text-white"
                                    : "bg-[#F5EFE6] text-[#6B6B6B] hover:bg-[#E8D8C3]"
                            }`}
                        >
                            {cat.nombre}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
                {filteredMenu.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No hay productos disponibles</p>
                ) : (
                    filteredMenu.map((product) => {
                        const cartItem = cart.find((c) => c.id_producto === product._id);
                        return (
                            <div key={product._id} className="bg-white rounded-xl border border-[#E8D8C3] p-4 flex gap-4">
                                <div className="w-20 h-20 rounded-lg bg-[#F5EFE6] flex items-center justify-center shrink-0">
                                    {product.foto_url?.[0] ? (
                                        <img src={product.foto_url[0]} alt={product.nombre} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span className="text-2xl">🍽️</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#2B2B2B]">{product.nombre}</h3>
                                    <p className="text-xs text-[#6B6B6B] truncate">{product.descripcion}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-bold text-[#E67E22]">Q{product.precio}</span>
                                        <div className="flex items-center gap-2">
                                            {cartItem && (
                                                <>
                                                    <button
                                                        onClick={() => removeFromCart(product._id)}
                                                        className="w-7 h-7 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#E67E22] hover:bg-[#E8D8C3] transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-bold text-[#2B2B2B] w-5 text-center">
                                                        {cartItem.cantidad}
                                                    </span>
                                                </>
                                            )}
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-7 h-7 rounded-full bg-[#E67E22] flex items-center justify-center text-white hover:bg-[#D35400] transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D8C3] shadow-lg p-4 z-50">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-[#6B6B6B]">
                                {cartCount} {cartCount === 1 ? "producto" : "productos"}
                            </span>
                            <span className="font-bold text-[#2B2B2B] text-lg">Q{cartTotal.toFixed(2)}</span>
                        </div>
                        <select
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E8D8C3] rounded-lg mb-3 focus:ring-2 focus:ring-[#E67E22] outline-none"
                        >
                            <option value="Comer aquí">Comer aquí</option>
                            <option value="Para llevar">Para llevar</option>
                            <option value="Domicilio">Domicilio</option>
                        </select>
                        <button
                            onClick={handleOrder}
                            disabled={ordering}
                            className="w-full bg-[#E67E22] text-white py-3 rounded-xl font-bold hover:bg-[#D35400] transition-colors disabled:opacity-60"
                        >
                            {ordering ? "Procesando..." : "Realizar Pedido"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
