import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Login from "./auth/components/Login.jsx";
import Register from "./Register/Register.jsx";
import ForgotPassword from "./forgetpassword/ForgotPassword.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import AdminRoutes from "./routes/AdminRoutes.jsx";
import CompanyRoutes from "./routes/CompanyRoutes.jsx";
import EmployeeRoutes from "./routes/EmployeeRoutes.jsx";
import { userData } from "./dashboard/redux/reducer.js";
import DefaultLayout from "./defaultLayout/DefaultLayout.jsx";
import Dashboard from "./Profile/Profile.jsx";

const RoutesComponent = () => {
    const { userdata } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(userData());
    }, [dispatch]);

    const userRole = userdata?.data?.roles?.[0]?.name;
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/"
                index
                element={token ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
                path="/login"
                element={token ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
              <Route
                path="/"
                element={<PrivateRoute element={<DefaultLayout />} />}
            >
                <Route path="dashboard" element={<Dashboard />} />
            </Route>

            {/* Role-Based Private Routes */}
            {userRole === "super_admin" && (
                <Route path="/*" element={<AdminRoutes />} />
            )}
            {userRole === "company" && (
                <Route path="/*" element={<CompanyRoutes />} />
            )}
            {userRole === "employee" && (
                <Route path="/*" element={<EmployeeRoutes />} />
            )}

            {/* Fallback Route */}
            <Route
                path="*"
                element={
                    <Navigate to={token ? "/dashboard" : "/login"} replace />
                }
            />
        </Routes>
    );
};

export default RoutesComponent;
