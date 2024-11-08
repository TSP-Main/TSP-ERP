import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const withAuth = (WrappedComponent) => {
    return function AuthHOC(props) {
        const navigate = useNavigate();
        const location = useLocation();

        useEffect(() => {
            const token = localStorage.getItem("access_token");

            // If no token, redirect to login
            if (!token) {
                navigate("/login");
            }
            // If token exists and the user is trying to access the login page, redirect them to the dashboard
            else {
                navigate("/");
            }
        }, [navigate, location.pathname]);

       
    };
};

export default withAuth;
