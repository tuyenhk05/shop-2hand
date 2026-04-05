//import Layoutt from "../components/Layout";
import Home from "../pages/home/index.home";
import Register from "../pages/register/Register";
import Login from "../pages/login/Login";
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
    }
]