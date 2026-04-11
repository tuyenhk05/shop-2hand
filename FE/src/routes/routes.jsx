//import Layoutt from "../components/Layout";
import Home from "../pages/home/index.home";
import Register from "../pages/register/Register";
import Login from "../pages/login/Login";
import CompleteProfile from "../pages/complete_profile/complete_profile.jsx";
import ForgotPassword from "../pages/forget_password/forgetPassword";
import ClientLayout from "../components/layout/layout";
import Store from "../pages/store/Store";
import ProductDetail from "../pages/product_detail/ProductDetail";
import Sustain from "../pages/sustain/Sustain";
import Wishlist from "../pages/wishlist/Wishlist";
import Dashboard from "../pages/dashboard/Dashboard";
import Checkout from "../pages/checkout/Checkout";
import Consignment from "../pages/consignment/Consignment";
import PurchaseHistory from "../pages/history/PurchaseHistory";
export const routes = [
    {
        path: "/",
        element: <ClientLayout />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/products",
                element: <Store />
            },
            {
                path: "/products/:slug",
                element: <ProductDetail />
            },
            {
                path: "/sustain",
                element: <Sustain />
            },
            {
                path: "/wishlist",
                element: <Wishlist />
            },
            {
                path: "/dashboard",
                element: <Dashboard />
            },
            {
                path: "/checkout",
                element: <Checkout />
            },
            {
                path: "/cart", // Tạm thời ánh xạ chung với checkout
                element: <Checkout />
            },
            {
                path: "/consignment",
                element: <Consignment />
            },
            {
                path: "/history",
                element: <PurchaseHistory />
            }
        ]
    },
    {
        path: "/register", 
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/complete-profile",
        element: <CompleteProfile />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    }
]
