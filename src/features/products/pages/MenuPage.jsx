import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { getMenuByRestaurant, getCategoriesByRestaurant, createOrder, getAddresses, validateCoupon, getRestaurantById } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { ArrowLeft, Plus, Minus, MapPin, CreditCard, Banknote, Tag, Clock, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { DatePicker, TimePicker } from "../../../shared/ui/DatePicker";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

const TIP_OPTIONS = [0, 5, 10, 15, 20];

export const MenuPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [serviceType, setServiceType] = useState("Comer aquí");
    const [direccion, setDireccion] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [metodoPago, setMetodoPago] = useState("efectivo");
    const [propina, setPropina] = useState(0);
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const [fechaProgramada, setFechaProgramada] = useState(null);
    const [horaProgramada, setHoraProgramada] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [productSearch, setProductSearch] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const requests = [getMenuByRestaurant(id), getCategoriesByRestaurant(id), getRestaurantById(id)];
                const [menuRes, catRes, restRes] = await Promise.all(requests);
                setMenu(menuRes.data.menu || []);
                setCategories(catRes.data.categories || []);
                setRestaurant(restRes.data.restaurant || null);
                try {
                    const addrRes = await getAddresses();
                    const addrs = addrRes.data.direcciones || [];
                    setAddresses(addrs);
                    const predet = addrs.find(a => a.predeterminada);
                    if (predet) setDireccion(predet.direccion);
                } catch { /* no autenticado o sin direcciones */ }
            } catch (err) {
                console.error("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const repeatId = searchParams.get("repeat");
        if (repeatId && menu.length > 0) {
            try {
                const items = JSON.parse(searchParams.get("items") || "[]");
                if (items.length > 0) {
                    setCart(items.map(item => ({
                        id_producto: item.id_producto,
                        nombre: item.nombre,
                        precio: item.precio,
                        cantidad: item.cantidad,
                    })));
                    showSuccess("Pedido precargado para repetir");
                }
            } catch { /* ignore */ }
        }
    }, [searchParams, menu]);

    const filteredMenu = menu.filter((p) => {
        if (activeCategory && p.categoria?._id !== activeCategory) return false;
        if (productSearch) {
            const q = productSearch.toLowerCase();
            if (!p.nombre.toLowerCase().includes(q) && !p.descripcion?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

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
            return [...prev, { id_producto: product._id, nombre: product.nombre, precio: product.precio, cantidad: 1 }];
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
    const totalConDescuento = Math.max(0, cartTotal - couponDiscount + propina);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            setCouponLoading(true);
            const { data } = await validateCoupon(couponCode.trim(), cartTotal);
            setCouponDiscount(data.descuento);
            setCouponApplied(true);
            showSuccess(data.message);
        } catch (err) {
            showError(err.response?.data?.message || "Cupón inválido");
            setCouponDiscount(0);
            setCouponApplied(false);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleOrder = async () => {
        if (cart.length === 0) return;
        if (serviceType === "Domicilio" && !direccion.trim()) {
            showError("Ingresa la dirección de entrega para domicilio");
            return;
        }

        const sucursalId = searchParams.get("id_sucursal") || "";
        const horarios = sucursalId && restaurant?.sucursales?.length
            ? restaurant.sucursales.find(s => s._id === sucursalId)?.horarios_atencion
            : restaurant?.horarios_atencion;

        if (fechaProgramada || horaProgramada) {
            if (!fechaProgramada || !horaProgramada) {
                showError("Si deseas programar el pedido, selecciona fecha y hora");
                return;
            }
            const [h, m] = horaProgramada.split(":").map(Number);
            const dt = new Date(fechaProgramada);
            dt.setHours(h, m, 0, 0);
            const now = new Date();

            if (dt <= now) {
                showError("La fecha y hora deben ser en el futuro");
                return;
            }

            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 1);
            if (dt > maxDate) {
                showError("No puedes programar un pedido con más de 1 mes de anticipación");
                return;
            }

            if (horarios) {
                const [, cierreStr] = horarios.split(" - ");
                const [cierreH, cierreM] = cierreStr.split(":").map(Number);
                const cierreDate = new Date(fechaProgramada);
                cierreDate.setHours(cierreH, cierreM, 0, 0);
                cierreDate.setMinutes(cierreDate.getMinutes() - 30);
                if (dt > cierreDate) {
                    showError(`El pedido programado debe ser al menos 30 minutos antes del cierre (${cierreStr})`);
                    return;
                }
            }
        } else if (horarios) {
            const [, cierreStr] = horarios.split(" - ");
            const [cierreH, cierreM] = cierreStr.split(":").map(Number);
            const now = new Date();
            const cierreToday = new Date();
            cierreToday.setHours(cierreH, cierreM, 0, 0);
            cierreToday.setMinutes(cierreToday.getMinutes() - 30);
            if (now > cierreToday) {
                showError(`El restaurante cierra a las ${cierreStr}. Para entrega inmediata debes ordenar al menos 30 minutos antes del cierre. Puedes programar tu pedido para otro día.`);
                return;
            }
        }
        try {
            setOrdering(true);
            const orderData = {
                id_restaurante: id,
                id_sucursal: searchParams.get("id_sucursal") || "",
                tipo_servicio: serviceType,
                items: cart.map(({ id_producto, cantidad }) => ({ id_producto, cantidad })),
                metodo_pago: metodoPago,
                propina,
            };
            if (serviceType === "Domicilio") orderData.direccion_entrega = direccion.trim();
            if (couponApplied && couponCode) {
                orderData.codigo_cupon = couponCode.trim();
                orderData.descuento_cupon = couponDiscount;
            }
            if (fechaProgramada && horaProgramada) {
                const [h, m] = horaProgramada.split(":");
                const dt = new Date(fechaProgramada);
                dt.setHours(parseInt(h), parseInt(m), 0, 0);
                const y = dt.getFullYear();
                const mo = String(dt.getMonth() + 1).padStart(2, "0");
                const da = String(dt.getDate()).padStart(2, "0");
                orderData.fecha_programada = `${y}-${mo}-${da}T${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}:00.000`;
            }
            await createOrder(orderData);
            showSuccess("Pedido creado exitosamente");
            setCart([]);
            setCouponCode("");
            setCouponDiscount(0);
            setCouponApplied(false);
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
                <div className="max-w-4xl mx-auto px-4 pb-2">
                    <div className="flex items-center gap-2 bg-[#F5EFE6] rounded-xl px-3 h-9">
                        <Search size={14} className="text-[#6B6B6B] shrink-0" />
                        <input
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            className="outline-none text-sm w-full bg-transparent text-[#2B2B2B] placeholder:text-[#6B6B6B]"
                        />
                        {productSearch && (
                            <button onClick={() => setProductSearch("")} className="text-[#6B6B6B] hover:text-[#C0392B]">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-thin">
                    <button
                        onClick={() => setActiveCategory("")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                            !activeCategory ? "bg-[#E67E22] text-white" : "bg-[#F5EFE6] text-[#6B6B6B] hover:bg-[#E8D8C3]"
                        }`}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                activeCategory === cat._id ? "bg-[#E67E22] text-white" : "bg-[#F5EFE6] text-[#6B6B6B] hover:bg-[#E8D8C3]"
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
                                                    <button onClick={() => removeFromCart(product._id)} className="w-7 h-7 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#E67E22] hover:bg-[#E8D8C3] transition-colors">
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-bold text-[#2B2B2B] w-5 text-center">{cartItem.cantidad}</span>
                                                </>
                                            )}
                                            <button onClick={() => addToCart(product)} className="w-7 h-7 rounded-full bg-[#E67E22] flex items-center justify-center text-white hover:bg-[#D35400] transition-colors">
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
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D8C3] shadow-lg p-4 z-50 max-h-[80vh] overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-[#6B6B6B]">{cartCount} {cartCount === 1 ? "producto" : "productos"}</span>
                            <span className="font-bold text-[#2B2B2B] text-lg">Q{cartTotal.toFixed(2)}</span>
                        </div>

                        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E8D8C3] rounded-lg mb-3 focus:ring-2 focus:ring-[#E67E22] outline-none">
                            <option value="Comer aquí">Comer aquí</option>
                            <option value="Para llevar">Para llevar</option>
                            <option value="Domicilio">Domicilio</option>
                        </select>

                        {serviceType === "Domicilio" && (
                            <div className="mb-3 space-y-2">
                                {addresses.length > 0 && (
                                    <select value={direccion} onChange={(e) => setDireccion(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#E8D8C3] rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none">
                                        <option value="">Seleccionar dirección guardada...</option>
                                        {addresses.map(a => (
                                            <option key={a._id} value={a.direccion}>{a.etiqueta}: {a.direccion}</option>
                                        ))}
                                    </select>
                                )}
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E67E22]" />
                                    <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)}
                                        placeholder="O escribe una dirección nueva..."
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8D8C3] rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none" />
                                </div>
                            </div>
                        )}

                        {/* Método de pago */}
                        <div className="flex gap-2 mb-3">
                            <button onClick={() => setMetodoPago("efectivo")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${metodoPago === "efectivo" ? "border-[#E67E22] bg-[#F5EFE6] text-[#E67E22]" : "border-[#E8D8C3] text-[#6B6B6B]"}`}>
                                <Banknote size={16} /> Efectivo
                            </button>
                            <button onClick={() => setMetodoPago("tarjeta")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${metodoPago === "tarjeta" ? "border-[#E67E22] bg-[#F5EFE6] text-[#E67E22]" : "border-[#E8D8C3] text-[#6B6B6B]"}`}>
                                <CreditCard size={16} /> Tarjeta
                            </button>
                        </div>

                        {/* Opciones avanzadas */}
                        <button onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors mb-2">
                            <span>Más opciones (cupón, propina, programar)</span>
                            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showAdvanced && (
                            <div className="space-y-3 mb-3 p-3 bg-[#F5EFE6] rounded-xl">
                                {/* Cupón */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#6B6B6B] mb-1"><Tag size={12} className="inline mr-1" />Cupón de descuento</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); setCouponDiscount(0); }}
                                            placeholder="CÓDIGO"
                                            className="flex-1 px-3 py-2 text-sm border border-[#E8D8C3] rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none uppercase" />
                                        <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                                            className="px-4 py-2 bg-[#E67E22] text-white text-sm font-semibold rounded-lg hover:bg-[#D35400] transition-colors disabled:opacity-60">
                                            {couponLoading ? "..." : "Aplicar"}
                                        </button>
                                    </div>
                                    {couponApplied && (
                                        <p className="text-xs text-[#A8D5BA] mt-1 font-semibold">Cupón aplicado: -Q{couponDiscount.toFixed(2)}</p>
                                    )}
                                </div>

                                {/* Propina */}
                                {serviceType === "Domicilio" && (
                                    <div>
                                        <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Propina al repartidor</label>
                                        <div className="flex gap-2">
                                            {TIP_OPTIONS.map(val => (
                                                <button key={val} onClick={() => setPropina(val)}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${propina === val ? "bg-[#E67E22] text-white" : "bg-white text-[#6B6B6B] border border-[#E8D8C3]"}`}>
                                                    {val === 0 ? "No" : `Q${val}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Programar pedido — solo para Para llevar y Domicilio */}
                                {serviceType !== "Comer aquí" && (
                                <div>
                                    <label className="block text-xs font-semibold text-[#6B6B6B] mb-1"><Clock size={12} className="inline mr-1" />Programar para después</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <DatePicker
                                                value={fechaProgramada}
                                                onChange={setFechaProgramada}
                                                placeholder="Fecha"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <TimePicker
                                                value={horaProgramada}
                                                onChange={setHoraProgramada}
                                                placeholder="Hora"
                                                selectedDate={fechaProgramada}
                                                openingTime={(() => {
                                                    const sId = searchParams.get("id_sucursal") || "";
                                                    const h = sId && restaurant?.sucursales?.length
                                                        ? restaurant.sucursales.find(s => s._id === sId)?.horarios_atencion
                                                        : restaurant?.horarios_atencion;
                                                    return h ? h.split(" - ")[0] : "";
                                                })()}
                                                closingTime={(() => {
                                                    const sId = searchParams.get("id_sucursal") || "";
                                                    const h = sId && restaurant?.sucursales?.length
                                                        ? restaurant.sucursales.find(s => s._id === sId)?.horarios_atencion
                                                        : restaurant?.horarios_atencion;
                                                    if (!h) return "";
                                                    const [, cierreStr] = h.split(" - ");
                                                    const [cH, cM] = cierreStr.split(":").map(Number);
                                                    const d = new Date();
                                                    d.setHours(cH, cM, 0, 0);
                                                    d.setMinutes(d.getMinutes() - 30);
                                                    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                                                })()}
                                            />
                                        </div>
                                    </div>
                                    {fechaProgramada && (
                                        <p className="text-xs text-[#E67E22] mt-1 font-semibold">
                                            {format(fechaProgramada, "EEE d MMM, yyyy", { locale: es })}{horaProgramada ? ` a las ${horaProgramada}` : ""}
                                        </p>
                                    )}
                                </div>
                                )}
                            </div>
                        )}

                        {/* Resumen */}
                        <div className="space-y-1 mb-3 text-sm">
                            <div className="flex justify-between text-[#6B6B6B]">
                                <span>Subtotal</span><span>Q{cartTotal.toFixed(2)}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-[#A8D5BA] font-semibold">
                                    <span>Descuento</span><span>-Q{couponDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            {propina > 0 && (
                                <div className="flex justify-between text-[#6B6B6B]">
                                    <span>Propina</span><span>Q{propina.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-[#2B2B2B] text-base border-t border-[#E8D8C3] pt-1">
                                <span>Total</span><span>Q{totalConDescuento.toFixed(2)}</span>
                            </div>
                        </div>

                        <button onClick={handleOrder} disabled={ordering}
                            className="w-full bg-[#E67E22] text-white py-3 rounded-xl font-bold hover:bg-[#D35400] transition-colors disabled:opacity-60">
                            {ordering ? "Procesando..." : `Realizar Pedido — Q${totalConDescuento.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
