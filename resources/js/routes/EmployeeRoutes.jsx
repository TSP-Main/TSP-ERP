import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "../defaultLayout/DefaultLayout.jsx";
import Attendance from "../attendance/index.jsx";
import { Outlet } from "react-router-dom";
import Missed from '../reports/missed/index.jsx'
import Attended from '../reports/attended/index.jsx'
import Availibility from "../attendance/Availibility.jsx";
const EmployeeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DefaultLayout />}>
                {/* Render child routes inside DefaultLayout */}
                <Route path="attendance" element={<Attendance />} />
                <Route path="missed" element={<Missed />} />
                <Route path="attended" element={<Attended />} />
                <Route path="availibility" element={<Availibility />} />
                {/* Add other employee-specific routes here */}
            </Route>
        </Routes>
    );
};

export default EmployeeRoutes;
