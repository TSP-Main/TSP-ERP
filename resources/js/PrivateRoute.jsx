// PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
const PrivateRoute = ({ element }) => {
   const { userdata } = useSelector((state) => state.user);
   const token =
       localStorage.getItem("access_token") ||
       sessionStorage.getItem("access_token");
    // If token is present, render the protected component, otherwise redirect to login
    if (!token || !userdata) {
        // If not authenticated, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the component
    return element;
};

export default PrivateRoute;
