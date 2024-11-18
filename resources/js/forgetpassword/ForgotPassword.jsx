import React, { useState } from "react";
import CustomInput from "../components/CustomInput";
import { Button, Form, notification, Flex } from "antd";
import { SendOutlined, CheckCircleOutlined } from "@ant-design/icons";
import logo from "../assests/tms_logo.png";
import styles from "./ForgotPassword.module.css";
import apiRoutes from "../routes/apiRoutes";
import axios from "../services/axiosService";
import { useNavigate } from "react-router-dom";
const ForgotPassword = () => {
    const [step, setStep] = useState(1); // Step tracking (1: email, 2: code, 3: password)
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");
    const navigate=useNavigate();
    // Loading states for each step
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingCode, setLoadingCode] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleEmailSubmit = async () => {
        setLoadingEmail(true);
        const payload = {
            email: email,
        };
        try {
            const response = await axios.post(
                apiRoutes.forgotpassword.email,
                payload
            );
            setStep(2); // Move to code input step
            notification.success({
                description: response.data.message,
                duration: 2,
            });
        } catch (error) {
            notification.error({
                description: error.response?.message || "Invalid Email",
                duration: 2,
            });
        } finally {
            setLoadingEmail(false); // Reset loading state
        }
    };

    const handleCodeSubmit = async () => {
        setLoadingCode(true);
        const payload = {
            email: email,
            otp: code,
        };
        try {
            const response = await axios.post(
                apiRoutes.forgotpassword.verifyCode,
                payload
            );
            notification.success({
                description: response.data.message,
                duration: 2,
            });
            setToken(response.data.data.token);
            setStep(3); // Move to password input step
        } catch (error) {
            notification.error({
                message: "Error",
                description: error?.response?.message || "Invalid Code",
                duration: 3,
            });
        } finally {
            setLoadingCode(false); // Reset loading state
        }
    };

    const handlePasswordSubmit = async () => {
        setLoadingPassword(true);
        const payload = {
            email: email,
            password: password,
            password_confirmation: confirmPassword,
            token: token,
        };
        try {
            const response = await axios.post(
                apiRoutes.forgotpassword.resetPassword,
                payload
            );
            notification.success({
                description: response.data.message,
                duration: 2,
            });
            navigate('/login');
        } catch (error) {
            notification.error({
                message: "Error",
                description:
                    error?.response?.message || "Failed to reset password",
                duration: 3,
            });
        } finally {
            setLoadingPassword(false); // Reset loading state
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginFormWrapper}>
                <div className="demo-logo-vertical">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="login-header">
                    <h2
                        style={{
                            fontWeight: "bold",
                            marginBottom: "10px",
                            padding: 0,
                        }}
                    >
                        Forget Password
                    </h2>
                </div>

                <Form
                    layout="vertical"
                    style={{
                        margin: 0,
                        padding: 0,
                    }}
                >
                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <Flex>
                            <CustomInput
                                name="email"
                                placeholder="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please input your email!",
                                    },
                                ]}
                            />
                            <Button
                                fontSize="10px"
                                type="link"
                                onClick={handleEmailSubmit}
                                disabled={!email || loadingEmail}
                                className={styles.sendButton}
                                loading={loadingEmail}
                            >
                                <SendOutlined />
                            </Button>
                        </Flex>
                    )}

                    {/* Step 2: Code Input */}
                    {step === 2 && (
                        <>
                            <CustomInput
                                name="code"
                                placeholder="Enter Verification Code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter the verification code!",
                                    },
                                ]}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                }}
                            >
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<CheckCircleOutlined />}
                                    onClick={handleCodeSubmit}
                                    disabled={!code || loadingCode}
                                    loading={loadingCode}
                                >
                                    Verify Code
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Password and Confirm Password Input */}
                    {step === 3 && (
                        <>
                            <CustomInput
                                name="password"
                                placeholder="New Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please input your new password!",
                                    },
                                ]}
                            />

                            <CustomInput
                                name="confirm_password"
                                placeholder="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                dependencies={["password"]}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please confirm your password!",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                !value ||
                                                getFieldValue("password") ===
                                                    value
                                            ) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error(
                                                    "The two passwords do not match!"
                                                )
                                            );
                                        },
                                    }),
                                ]}
                            />
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                className={styles.customButton}
                                onClick={handlePasswordSubmit}
                                disabled={loadingPassword}
                                loading={loadingPassword}
                            >
                                Reset Password
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
};

export default ForgotPassword;
