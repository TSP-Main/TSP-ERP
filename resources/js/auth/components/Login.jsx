import React, { useState } from "react";
import { Button, Form, notification } from "antd";
import CustomInput from "../../components/CustomInput";
import WelcomePage from "../../components/WelcomePage";
import styles from "../styles/Login.module.css"; // Import CSS Module
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/loginReducer";

const Login = () => {
    const dispatch = useDispatch();
    const { error, loading } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [rememberMe, setRememberMe] = useState(false);

    const handleLoginClick = async (values) => {
        const response = await dispatch(login(values));
        console.log("response", response);

        if (error) {
            notification.error({
                message: "Error",
                description: response.payload || error || "Login failed",
                duration: 3,
            });
        } else if (!error) {
            const accessToken = response.payload?.data?.data?.access_token;

            if (accessToken) {
                if (rememberMe) {
                    localStorage.setItem("access_token", accessToken);
                } else {
                    sessionStorage.setItem("access_token", accessToken);
                }
            }

            navigate("/profile");
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginFormWrapper}>
                <div className={styles.loginHeader}>
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
                        <label className={styles.rememberMe}>
                            <input
                                type="checkbox"
                                name="remember"
                                checked={rememberMe}
                                onChange={(e) =>
                                    setRememberMe(e.target.checked)
                                }
                            />
                            Remember Me
                        </label>
                        <a className={styles.forgotPassword} href="/forget-password">
                            Forgot Password
                        </a>
                    </div>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className={styles.customButton}
                            loading={loading}
                        >
                            Login
                        </Button>
                    </Form.Item>
                    <div className={styles.loginFooter}>
                        <p>
                            Don't have an account?{" "}
                            <a href="/register">Sign Up</a>
                        </p>
                    </div>
                </Form>
            </div>
            
            <WelcomePage
                containerStyle={{
                    borderRadius: "0px 8px 8px 0px",
                }}
                title="Hello Friend"
                description="Sign Up to access your personalized dashboard and features."
                buttonText="Sign Up"
                linkPath="/register"
            />
        </div>
    );
};

export default Login;
