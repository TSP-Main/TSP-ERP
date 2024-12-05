import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "../defaultLayout/DefaultLayout.jsx";
import RotaManager from "../manager/rota/index.jsx"
import ActiveEmployee from "../manager/EmployeesM.jsx"
import InActiveEmployeeM from "../manager/InActiveEmployeeM.jsx"
import InvitedEmployess from "../manager/InvitedEmployees.jsx"
const ManagerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DefaultLayout />}>
                <Route path="rota-manager" element={<RotaManager/>}/>
                <Route path="active-manager-employee" element={<ActiveEmployee/>}/>
                <Route path="inactive-manager-employee" element={<InActiveEmployeeM/>}/>
                <Route path="invited-manager-employee" element={<InvitedEmployess/>}/>
            </Route>
               
        </Routes>
    );
};

export default ManagerRoutes;
