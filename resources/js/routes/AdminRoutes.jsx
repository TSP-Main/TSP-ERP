import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "../defaultLayout/DefaultLayout.jsx";
import OnBoard from "../company/OnBoard.jsx";
import InActive from "../company/InActive.jsx";
import AllUsers from "../company/AllUsers.jsx";
const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DefaultLayout />}>
                {/* Nested routes */}
                <Route path="onboard" element={<OnBoard />} />
                <Route path="all-users" element={<AllUsers />} />
                <Route path="inactive" element={<InActive />} />
                {/* Add other admin-specific routes here */}
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
