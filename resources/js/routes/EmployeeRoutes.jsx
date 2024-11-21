import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "../defaultLayout/DefaultLayout.jsx";
import Attendance from "../attendance/index.jsx";
import Profile from "../dashboard/Dashboard.jsx";
import PrivateRoute from "../PrivateRoute.jsx";

const EmployeeRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<PrivateRoute element={<DefaultLayout />} />}
            >
                <Route path="profile" element={<Profile />} />
                <Route path="attendance" element={<Attendance />} />
                {/* Add other employee-specific routes here */}
            </Route>
        </Routes>
    );
};

export default EmployeeRoutes;
