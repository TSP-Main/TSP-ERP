import React, { useContext, useState } from "react";
import loginService from "../services/loginService";
import { Button, Form, notification } from "antd";
import CustomInput from "../../components/CustomInput";
import WelcomePage from "../../components/WelcomePage";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/userContext";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { login } from "../redux/loginReducer";

const Login = () => {
    // const { user, setUser } = useContext(UserContext);
    const dispatch = useDispatch();
    const { error, loading } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const handleLoginClick = async (values) => {
        const response = await dispatch(login(values));

        console.log("login error",response);
        if (response.error) {
            notification.error({
                message: "Error",
                description: response.payload || "Login failed",
            });
            return;
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-wrapper">
                <div className="login-header">
                    <h2 style={{ fontWeight: "bold" }}>Sign In</h2>
                </div>
                <Form layout="vertical" onFinish={handleLoginClick}>
                    <CustomInput
                        name="email"
                        placeholder="Email"
                        type="email"
                        
                        rules={[
                            {
                                required: true,
                                message: "Please input your Email!",
                            },
                        ]}
                    />
                    <CustomInput
                        name="password"
                        placeholder="Password"
                        type="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your password!",
                            },
                        ]}
                    />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <label className="remember-me">
                            <input type="checkbox" name="remember" />
                            Remember Me
                        </label>
                        <a className="forgot-password" href="">
                            Forgot Password
                        </a>
                    </div>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="custom-button"
                            loading={loading}
                        >
                            Login
                        </Button>
                    </Form.Item>
                    <div className="login-footer">
                        <p>
                            Don't have an account?{" "}
                            <a href="/register">Sign Up</a>
                        </p>
                    </div>
                </Form>
            </div>

            <WelcomePage
                title="Hello Friend"
                description="Sign Up to access your personalized dashboard and features."
                buttonText="Sign Up"
                linkPath="/register"
            />
        </div>
    );
};

export default Login;
