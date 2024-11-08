// PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
    const token = localStorage.getItem("access_token");

    // If token is present, render the protected component, otherwise redirect to login
    return token ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
