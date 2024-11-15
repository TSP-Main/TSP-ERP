import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import withAuth from "./middlewares/withAuth.js";
import Login from "./auth/components/Login.jsx";
import Register from "./Register/Register.jsx";
import DefaultLayout from "./defaultLayout/DefaultLayout.jsx";
import CreatePassword from "./createpassword/CreatePassword.jsx";
import Attendance from './attendance/index.jsx'
import ForgotPassword from "./forgetpassword/ForgotPassword.jsx";
import OnBoard from "./company/OnBoard.jsx";
import InActive from "./company/InActive.jsx";
import Employee from "./employee/Employee.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import Shift from './shift/index.jsx'
import "../css/app.css";
import Dashboard from "./dashboard/Dashboard.jsx";
import AssignShift from './assign_shift/index.jsx'
import NewRegistration from './new_registration/index.jsx'
// Main App Component
function App() {
    const token = localStorage.getItem("access_token");
    const isAuthenticated = token !== null && token !== undefined;
    console.log(token)
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    {/* Redirect root URL to login or dashboard based on token */}
                    <Route
                        path="/"
                        index
                        element={
                            isAuthenticated ? (
                                <Navigate to="/profile" />
                            ) : (
                                <Login />
                            )
                        }
                    />

                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ? (
                                <Navigate to="/profile" />
                            ) : (
                                <Login />
                            )
                        }
                    />
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
                        path="/"
                        element={<PrivateRoute element={<DefaultLayout />} />}
                    >
                        <Route path="onboard" element={<OnBoard />} />
                        <Route path="inactive" element={<InActive />} />
                        <Route path="employee" element={<Employee />} />
                        <Route path="profile" element={<Dashboard />} />
                        <Route path="shift" element={<Shift />} />
                        <Route path="assign-shift" element={<AssignShift />} />
                        <Route
                            path="new-registration"
                            element={<NewRegistration />}
                        />
                        <Route path="attendance" element={<Attendance />} />
                        {/* Add more protected routes here */}
                    </Route>

                    {/* Redirect any unknown paths */}
                    <Route
                        path="*"
                        element={
                            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
                        }
                    />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

// Render App component to the root element
const rootElement = document.getElementById("app");

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
} else {
    console.error("Root element with id 'app' not found!");
}
