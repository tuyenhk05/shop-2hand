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
import VnPayReturn from "../pages/checkout/VnPayReturn";
import Consignment from "../pages/consignment/Consignment";
import PurchaseHistory from "../pages/history/PurchaseHistory";
import OrderDetail from "../pages/history/OrderDetail";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import AdminDashboard from "../pages/admin/AdminDashboard";
import RolesManagement from "../pages/admin/RolesManagement";
import UsersManagement from "../pages/admin/UsersManagement";
import CategoriesManagement from "../pages/admin/CategoriesManagement";
import ProductsManagement from "../pages/admin/ProductsManagement";
import ConsignmentsManagement from "../pages/admin/ConsignmentsManagement";
import OrdersManagement from "../pages/admin/OrdersManagement";
import { Navigate } from "react-router-dom";

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
                path: "/checkout/vnpay_return",
                element: <VnPayReturn />
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
            },
            {
                path: "/history/:orderId",
                element: <OrderDetail />
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
    },
    {
        path: "/admin/login",
        element: <AdminLogin />
    },
    {
        path: "/admin",
        element: <RequireAdminAuth />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    {
                        path: "",
                        element: <Navigate to="dashboard" replace />
                    },
                    {
                        path: "dashboard",
                        element: <AdminDashboard />
                    },
                    {
                        path: "roles",
                        element: <RolesManagement />
                    },
                    {
                        path: "users",
                        element: <UsersManagement />
                    },
                    {
                        path: "categories",
                        element: <CategoriesManagement />
                    },
                    {
                        path: "products",
                        element: <ProductsManagement />
                    },
                    {
                        path: "consignments",
                        element: <ConsignmentsManagement />
                    },
                    {
                        path: "orders",
                        element: <OrdersManagement />
                    }
                ]
            }
        ]
    }
]
