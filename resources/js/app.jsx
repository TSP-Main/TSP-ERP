import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store.js";
import withAuth from "./middlewares/withAuth.js";
import Login from "./auth/components/Login.jsx";
import Register from "./Register/Register.jsx";
import DefaultLayout from "./defaultLayout/DefaultLayout.jsx";
import CreatePassword from "./createpassword/CreatePassword.jsx";
import ForgotPassword from "./forgetpassword/ForgotPassword.jsx";
import OnBoard from "./company/OnBoard.jsx";
import "../css/app.css";
import PrivateRoute from "./PrivateRoute.jsx";
import InActive from './company/InActive.jsx';
import Employee from "./employee/Employee.jsx";

function App() {
    const token = localStorage.getItem("access_token");

    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    {/* Redirect root URL to login or dashboard based on token */}
                    <Route
                        path="/"
                        index
                        element={
                            token ? (
                                <Navigate to="/welcome" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/create-password"
                        element={<CreatePassword />}
                    />
                    <Route
                        path="/forget-password"
                        element={<ForgotPassword />}
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/welcome/"
                        element={<PrivateRoute element={<DefaultLayout />} />}
                    >
                        <Route path="onboard" element={<OnBoard />} />
                        <Route path="inactive" element={<InActive />} />
                        <Route path="employee" element={<Employee />} />
                        {/* Add more protected routes here */}
                    </Route>

                    {/* Redirect any unknown paths */}
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to={token ? "/dashboard" : "/login"}
                                replace
                            />
                        }
                    />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
