# 🌐 Bite&Go Client — Frontend Web

Frontend web para clientes de la plataforma Bite&Go. Explorar restaurantes, ver menús, hacer pedidos, reservar mesas, gestionar perfil y más.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter)

---

## 📋 Descripción

Aplicación web para clientes de Bite&Go. Consume la API del `user-service` (Node, puerto 3001) para mostrar restaurantes, menús, gestionar pedidos, reservas y perfil. La autenticación se realiza contra el `auth-service` (.NET, puerto 3000).

---

## ⚙️ Stack

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `react` | ^19.2.7 | UI library |
| `react-dom` | ^19.2.7 | Renderizado DOM |
| `vite` | ^8.1.0 | Build y HMR |
| `tailwindcss` | ^4.3.2 | Estilos utility-first |
| `@tailwindcss/vite` | ^4.3.2 | Plugin Vite para Tailwind |
| `@material-tailwind/react` | ^2.1.10 | Componentes Material Design |
| `zustand` | ^5.0.14 | Estado global |
| `react-router-dom` | ^7.18.0 | Navegación SPA |
| `react-hook-form` | ^7.74.0 | Formularios |
| `react-hot-toast` | ^2.6.0 | Notificaciones toast |
| `axios` | ^1.18.1 | HTTP client |
| `date-fns` | ^4.4.0 | Manipulación de fechas |
| `react-day-picker` | ^10.0.1 | DatePicker |
| `lucide-react` | ^1.8.0 | Iconos SVG |
| `@heroicons/react` | ^2.2.0 | Iconos UI |

---

## 🏗️ Estructura del Proyecto

```
client-user-bite-go/
├── src/
│   ├── app/
│   │   ├── main.jsx                  # Entry point (StrictMode > ThemeProvider > BrowserRouter)
│   │   ├── App.jsx                   # Root component (Toaster, syncSession, verifySession)
│   │   ├── layouts/
│   │   │   ├── Header.jsx            # Navbar sticky con logo, navegación, búsqueda, notificaciones
│   │   │   └── UserLayout.jsx        # Layout principal: Header + Outlet
│   │   └── router/
│   │       └── AppRouter.jsx         # Definición de rutas
│   │
│   ├── features/
│   │   ├── auth/                     # Autenticación
│   │   │   ├── store/authStore.js    # Zustand store (persistida)
│   │   │   ├── pages/
│   │   │   │   ├── AuthPage.jsx          # Login
│   │   │   │   ├── VerifyEmailPage.jsx   # Verificación de email
│   │   │   │   └── ResetPasswordPage.jsx # Restablecer contraseña
│   │   │   └── components/
│   │   │       ├── LoginForm.jsx
│   │   │       ├── RegisterForm.jsx      # Registro + cooldown reenvío 45s
│   │   │       └── ForgotPasswordForm.jsx
│   │   │
│   │   ├── restaurants/              # Restaurantes
│   │   │   └── pages/
│   │   │       ├── RestaurantsPage.jsx      # Listado con búsqueda, paginación, favoritos
│   │   │       ├── RestaurantDetailPage.jsx # Detalle con tabs (menú, eventos, reseñas) + selector sucursal
│   │   │       └── FavoritesPage.jsx        # Favoritos
│   │   │
│   │   ├── products/                 # Menú
│   │   │   └── pages/
│   │   │       └── MenuPage.jsx      # Menú completo con carrito, tipo servicio, cupón, propina, programar pedido
│   │   │
│   │   ├── orders/                   # Pedidos
│   │   │   └── pages/
│   │   │       ├── OrdersPage.jsx        # Historial (polling 8s, cancelar, repetir)
│   │   │       └── OrderDetailPage.jsx   # Detalle con progress bar (polling 8s)
│   │   │
│   │   ├── reservations/             # Reservas
│   │   │   └── pages/
│   │   │       └── ReservationsPage.jsx  # CRUD con DatePicker, TimePicker, disponibilidad en tiempo real
│   │   │
│   │   ├── profile/                  # Perfil
│   │   │   └── pages/
│   │   │       ├── ProfilePage.jsx       # Datos, foto (Cloudinary upload/delete)
│   │   │       └── AddressesPage.jsx     # CRUD direcciones con etiquetas
│   │   │
│   │   ├── reviews/                  # Reseñas
│   │   │   └── pages/
│   │   │       └── ReviewsPage.jsx       # Reseñas del usuario
│   │   │
│   │   └── notifications/            # Notificaciones
│   │       └── pages/
│   │           └── NotificationsPage.jsx # Lista con tipos, marcar leídas, polling 8s
│   │
│   └── shared/
│       ├── api/                      # Clientes Axios
│       │   ├── api.js                # axiosAuth + axiosUser + interceptors
│       │   ├── auth.js               # Auth-service endpoints
│       │   └── user.js               # User-service endpoints (40+ funciones)
│       ├── ui/
│       │   ├── AvatarUser.jsx        # Avatar con dropdown menú
│       │   └── DatePicker.jsx        # DatePicker + TimePicker personalizados
│       └── utils/
│           ├── toast.js              # showSuccess, showError, showInfo
│           └── confirmToast.jsx      # Modal de confirmación
│
├── .env                              # VITE_AUTH_URL, VITE_API_URL
├── .env.example
├── vercel.json                       # SPA routing para Vercel
└── vite.config.js
```

---

## 🧭 Rutas

| Ruta | Página | Acceso |
|------|--------|--------|
| `/auth` | AuthPage | Público |
| `/verify-email` | VerifyEmailPage | Público |
| `/reset-password` | ResetPasswordPage | Público |
| `/restaurants` | RestaurantsPage | Protegido |
| `/restaurants/:id` | RestaurantDetailPage | Protegido |
| `/restaurants/:id/menu` | MenuPage | Protegido |
| `/orders` | OrdersPage | Protegido |
| `/orders/:id` | OrderDetailPage | Protegido |
| `/reservations` | ReservationsPage | Protegido |
| `/reviews` | ReviewsPage | Protegido |
| `/favorites` | FavoritesPage | Protegido |
| `/addresses` | AddressesPage | Protegido |
| `/notifications` | NotificationsPage | Protegido |
| `/profile` | ProfilePage | Protegido |

> Las rutas protegidas redirigen a `/auth` si no hay sesión activa.

---

## 🔐 Flujo de Autenticación

1. **Login**: `LoginForm` → `authStore.login()` → `POST /api/v1/Auth/login` → recibe JWT → `syncUser()` para crear/actualizar registro en MongoDB
2. **Register**: `RegisterForm` → `POST /api/v1/Auth/register` (multipart) → muestra pantalla de verificación email → cooldown 45s para reenviar
3. **Session persistence**: `authStore` usa `zustand/middleware/persist` con localStorage key `"auth-store-user"`
4. **Session sync**: Al montar App, `syncSession()` llama `syncUser()` para refrescar perfil
5. **Session verify**: En cada `visibilitychange`, `verifySession()` llama `getMe()`. Si 401/404 → logout forzado (cuenta eliminada/desactivada)

---

## 📡 Conexiones API

| Cliente | Base URL | Timeout | Servicio |
|---------|----------|:-------:|----------|
| `axiosAuth` | `VITE_AUTH_URL` (default `http://localhost:3000`) | 8000ms | Auth-service .NET |
| `axiosUser` | `VITE_API_URL` (default `http://localhost:3001/bite-and-go/v1`) | 8000ms | User-service Node |

### Interceptores
- **Request**: Ambas instancias agregan `Authorization: Bearer <token>`
- **Response 401**: Logout automático si no está en `/auth`
- **Response 429**: Toast "Servidor saturado..." una vez cada 10s (no rompe polling)

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
cd client-user-bite-go
npm install

# 2. Variables de entorno (opcional, tiene defaults)
#    VITE_AUTH_URL=http://localhost:3000
#    VITE_API_URL=http://localhost:3001/bite-and-go/v1

# 3. Iniciar
npm run dev    # http://localhost:5173
npm run build  # Build producción
npm run preview
```

---

## 🚢 Despliegue (Vercel)

```bash
# 1. Build
npm run build

# 2. Desplegar
vercel --prod

# 3. Variables de entorno en Vercel:
#    VITE_AUTH_URL=https://auth-service.onrender.com
#    VITE_API_URL=https://user-service.onrender.com/bite-and-go/v1
```

> `vercel.json` ya está configurado para SPA routing (redirige todas las rutas a `index.html`).

---

## 🎨 Paleta de Colores

| Uso | Color |
|-----|-------|
| Primary | `#E67E22` |
| Dark primary | `#D35400` |
| Brown | `#3A2E2A` |
| Cream (bg) | `#F5EFE6` |
| Cream (card) | `#E8D8C3` |
| Gray | `#2B2B2B`, `#6B6B6B` |
| Rojo | `#C0392B` |
| Verde | `#A8D5BA` |
| Azul | `#A9C7E8` |
