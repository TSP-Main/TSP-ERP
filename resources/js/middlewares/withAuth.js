import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
     return function AuthHOC(props) {
         const navigate = useNavigate();

         useEffect(() => {
             const token = localStorage.getItem("access_token");
             if (token) {
                 navigate("/dashboard"); // Redirect to home if token exists
             } else navigate("/");
         }, [navigate]);

         return WrappedComponent(props);
     };
};

export default withAuth;
