import React, { useState } from "react";
import CustomInput from "../components/CustomInput";
import { Button, Form, notification, Flex } from "antd";
import { SendOutlined, CheckCircleOutlined } from "@ant-design/icons";
import logo from "../assests/tms_logo.png";
import styles from "./ForgotPassword.module.css";
import apiRoutes from "../routes/apiRoutes";
import axios from "../services/axiosService";
const ForgotPassword = () => {
    const [step, setStep] = useState(1); // Step tracking (1: email, 2: code, 3: password)
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleEmailSubmit = async() => {
        const payload={
            email:email
        }
        const response=await axios.post(apiRoutes.forgotpassword.email,payload)
        // Handle sending email for verification code
        console.log("Email submitted:", email);
        setStep(2); // Move to code input step
    };


    const handleCodeSubmit = async() => {
        const payload={
            email:email,
            otp:code,
        }
        const response=await axios.post(apiRoutes.forgotpassword.verifyCode,payload)
        if(response.error){
            notification.error({
                message: "Error",
                description: response?.error?.message,
                duration: 3,
            });
        }
        // Handle verifying code
        console.log("Code submitted:", code);
        setStep(3); // Move to password input step
    };

    const handlePasswordSubmit = () => {
        // Handle password change logic
        console.log("Password submitted:", password);
        if (password !== confirmPassword) {
            notification.error({
                message: "Passwords do not match",
            });
        } else {
            notification.success({
                message: "Password updated successfully",
            });
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
                                disabled={!email}
                                className={styles.sendButton}
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
                                    disabled={!code}
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
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please confirm your password!",
                                    },
                                ]}
                            />
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                className={styles.customButton}
                                onClick={handlePasswordSubmit}
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
