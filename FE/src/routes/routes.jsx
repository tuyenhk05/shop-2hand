//import Layoutt from "../components/Layout";
import Home from "../pages/home/index.home";
import Register from "../pages/register/Register";
import Login from "../pages/login/Login";
import CompleteProfile from "../pages/complete_profile/complete_profile.jsx";
import ForgotPassword from "../pages/forget_password/forgetPassword";
import Layout from "../components/layout/layout";


export const routes = [
    {
        path: "/",
        element: <Home />,
        
        //path: "/",
        //element: <Layoutt />,
        //children: [{
        //    path: "/",
        //    element: <Home />

        //}, {
        //    path: "login",
        //    element: <Login />
        //}, {
        //    path: "register",
        //    element: <Register />
        //}, {
        //    path: "allCourses",
        //    element: <Courses />,
        //    children: [
        //        {
        //            index: true,
        //            element: <AllCourses />
        //        }, {
        //            path: ":idCourses",
        //            element: <CourseDetail />
        //        }
        //    ]
        //}, {
        //    path: "profile",
        //    element: <Profile />
        //}, {
        //    path: "favorite",
        //    element: <FavoritesPage />
        //}
        //]
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
