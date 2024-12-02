import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "../defaultLayout/DefaultLayout.jsx";
import Employee from "../employee/Employee.jsx";
import Shift from "../shift/index.jsx";
import AssignShift from "../assign_shift/index.jsx";
import NewRegistration from "../new_registration/index.jsx";
import Profile from "../dashboard/Dashboard.jsx";
import InvitedEmployee from "../employee/InvitedEmployee.jsx";
import RejectedEmployee from "../employee/RejectedEmployee.jsx";
import ChangeShift from "../shift/ChangeShift.jsx";
import CheckedIn from "../employee/CheckedIn.jsx";
import InvitCancel from "../employee/InviteCancel.jsx";
import InActive from "../employee/InaActiveEmployee.jsx";
import Example from "../employee/Example.jsx";
const CompanyRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DefaultLayout />}>
                {/* Nested routes */}
                <Route path="profile" element={<Profile />} />
                <Route path="rota" element={<CheckedIn />} />
                <Route path="employee" element={<Employee />} />
                <Route path="in-active" element={<InActive />} />
                <Route path="shift" element={<Shift />} />
                <Route path="assign-shift" element={<AssignShift />} />
                <Route path="new-registration" element={<NewRegistration />} />
                <Route path="invites" element={<InvitedEmployee />} />
                <Route path="invite-cancel" element={<InvitCancel />} />

                <Route
                    path="rejected-employee"
                    element={<RejectedEmployee />}
                />
                <Route path="change-shift" element={<ChangeShift />} />
                <Route path="example" element={<Example />} />

                {/* Add other company-specific routes here */}
            </Route>
        </Routes>
    );
};

export default CompanyRoutes;
