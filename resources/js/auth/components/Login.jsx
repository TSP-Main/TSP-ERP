import React, { useState } from "react";
import { Button, Form, notification } from "antd";
import CustomInput from "../../components/CustomInput";
import WelcomePage from "../../components/WelcomePage";
import styles from "../styles/Login.module.css"; // Import CSS Module
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/loginReducer";
import { userData } from "../../dashboard/redux/reducer";
import { getDefaultPage } from "../../services/defaultPage";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

const Login = () => {
    const [visible, setVisible] = useState(false);
    const dispatch = useDispatch();
    const { error, loading } = useSelector((state) => state.auth); // Assuming user is available here
    const { userdata } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [rememberMe, setRememberMe] = useState(false);

    const handleLoginClick = async (values) => {
        try {
            // Unwrap the response to check for errors explicitly
            const response = await dispatch(login(values)).unwrap();

            const user_data = await dispatch(userData()).unwrap();

            const accessToken = response?.access_token;

            if (accessToken) {
                if (rememberMe) {
                    localStorage.setItem("access_token", accessToken);
                } else {
                    sessionStorage.setItem("access_token", accessToken);
                }
            }

            console.log("user data", user_data);
            notification.success({
                description: "Logged in successfully!",
                duration: 3,
            });

            // Get the default page based on the user's role
            // const defaultPage = getDefaultPage(user_data); // Pass the user data to get the default page
            // console.log("defaultPage", defaultPage);
            navigate('/dashboard'); // Navigate to the default page
        } catch (err) {
            console.error("Login error:", err);
            notification.error({
                description: err || "Login failed",
                duration: 3,
            });
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
                        <a
                            className={styles.forgotPassword}
                            href="/forget-password"
                        >
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
                title="Workforce Management Made Easier!"
                description="Sign up to effortlessly track attendance, manage shifts, and maintain work hours."
                buttonText="Sign Up"
                linkPath="/register"
            />
        </div>
    );
};

export default Login;
