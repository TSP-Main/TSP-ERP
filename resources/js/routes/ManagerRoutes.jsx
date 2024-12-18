import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "../defaultLayout/DefaultLayout.jsx";
import RotaManager from "../manager/rota/index.jsx"
import ActiveEmployee from "../manager/EmployeesM.jsx"
import InActiveEmployeeM from "../manager/InActiveEmployeeM.jsx"
import InvitedEmployess from "../manager/InvitedEmployees.jsx"
import InviteCanceledEmployee from "../manager/InviteCanceledEmployee.jsx";
import AssignShift from "../assign_shift/index.jsx";
import ChangeShift from "../shift/ChangeShift.jsx";
import CheckedIn from "../employee/CheckedIn.jsx";
import Missed from '../reports/missed/index.jsx'
import Attended from '../reports/attended/index.jsx'
import Availibility from "../attendance/Availibility.jsx";
import Attendance from "../attendance/index.jsx";
const ManagerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DefaultLayout />}>
                <Route path="rota-manager" element={<CheckedIn />} />
                <Route
                    path="active-manager-employee"
                    element={<ActiveEmployee />}
                />
                <Route
                    path="inactive-manager-employee"
                    element={<InActiveEmployeeM />}
                />
                <Route
                    path="invited-manager-employee"
                    element={<InvitedEmployess />}
                />
                <Route
                    path="invite-cancel-employee"
                    element={<InviteCanceledEmployee />}
                />
                <Route path="assign-shift" element={<AssignShift />} />
                <Route path="change-shift" element={<ChangeShift />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="missed" element={<Missed />} />
                <Route path="attended" element={<Attended />} />
                <Route path="availibility" element={<Availibility />} />
            </Route>
        </Routes>
    );
};

export default ManagerRoutes;
