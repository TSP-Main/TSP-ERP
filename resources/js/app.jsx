import React from "react";
import withAuth from "./middlewares/withAuth.js";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./auth/index.jsx";
import Register from "./Register/Register.jsx";
import DefaultLayout from "./defaultLayout/DefaultLayout.jsx";
import CreatePassword from "./createpassword/CreatePassword.jsx";
import ForgotPassword from "./forgetpassword/ForgotPassword.jsx";
import "../css/app.css";
import OnBoard from "./onboard/OnBoard.jsx";
import UserContextProvider from "./context/UserContextProvider.jsx";

function App() {
    const AuthenticatedDefaultLayout = withAuth(DefaultLayout);
    const Login = withAuth(Auth);

    return (
        <UserContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route
                        path="create-password"
                        element={<CreatePassword />}
                    />
                    <Route
                        path="/dashboard/"
                        element={<AuthenticatedDefaultLayout />}
                    >
                        <Route index path="onboard" element={<OnBoard />} />
                    </Route>
                    <Route
                        path="forget-password"
                        element={<ForgotPassword />}
                    />{" "}
                </Routes>
            </BrowserRouter>
        </UserContextProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
