import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "../defaultLayout/DefaultLayout.jsx";
import Employee from "../employee/Employee.jsx";
import Shift from "../shift/index.jsx";
import AssignShift from "../assign_shift/index.jsx";
import NewRegistration from "../new_registration/index.jsx";
import Profile from "../dashboard/Dashboard.jsx";
import PrivateRoute from "../PrivateRoute.jsx";

const CompanyRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<PrivateRoute element={<DefaultLayout />} />}
            >
                <Route path="profile" element={<Profile />} />
                <Route path="employee" element={<Employee />} />
                <Route path="shift" element={<Shift />} />
                <Route path="assign-shift" element={<AssignShift />} />
                <Route path="new-registration" element={<NewRegistration />} />
                
                {/* Add other company-specific routes here */}
            </Route>
        </Routes>
    );
};

export default CompanyRoutes;
