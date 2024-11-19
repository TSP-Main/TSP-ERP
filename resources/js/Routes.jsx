// src/Routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./auth/components/Login.jsx";
import Register from "./Register/Register.jsx";
import ForgotPassword from "./forgetpassword/ForgotPassword.jsx";
import DefaultLayout from "./defaultLayout/DefaultLayout.jsx";
import OnBoard from "./company/OnBoard.jsx";
import InActive from "./company/InActive.jsx";
import Employee from "./employee/Employee.jsx";
import Shift from "./shift/index.jsx";
import AssignShift from "./assign_shift/index.jsx";
import NewRegistration from "./new_registration/index.jsx";
import Attendance from "./attendance/index.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import { getDefaultPage } from "./services/defaultPage.js";

const RoutesComponent = () => {
    const { userdata } = useSelector((state) => state.user); // Using useSelector to get userdata
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    // Determine the default page based on role
    const defaultPage = getDefaultPage(userdata);

    return (
        <Routes>
            <Route
                path="/"
                index
                element={token ? <Navigate to={defaultPage} /> : <Login />}
            />
            <Route
                path="/login"
                element={token ? <Navigate to={defaultPage} /> : <Login />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
            <Route
                path="/"
                element={<PrivateRoute element={<DefaultLayout />} />}
            >
                <Route path="onboard" element={<OnBoard />} />
                <Route path="inactive" element={<InActive />} />
                <Route path="employee" element={<Employee />} />
                <Route path="shift" element={<Shift />} />
                <Route path="assign-shift" element={<AssignShift />} />
                <Route path="new-registration" element={<NewRegistration />} />
                <Route path="attendance" element={<Attendance />} />
            </Route>
            <Route
                path="*"
                element={
                    <Navigate to={token ? defaultPage : "/login"} replace />
                }
            />
        </Routes>
    );
};

export default RoutesComponent;
