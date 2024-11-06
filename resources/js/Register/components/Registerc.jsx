import React, { useState } from "react";
import CustomInput from "../../components/CustomInput";
import { Button, Form, Flex, notification } from "antd";
import WelcomePage from "../../components/WelcomePage";
import "../styles/register.css";
import { registerUser } from "../services/registerService";
const Register = () => {
    const [role, setUserType] = useState(null);
    const [loading,setLoading] = useState(false);
    const onUserTypeChange = (value) => {
        setUserType(value);
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            await registerUser(values);
        } catch (error) {
            notification.error({
                message: "Error",
                description: "Could not complete registration",
            });
        }finally{
            setLoading(false);
        }
    };

    // const { register, handleSubmit,formState:{ errors} } = useForm();
    return (
        <div className="login-container">
            <WelcomePage
                title="Hello Friend"
                description="Sign In to access your personalized dashboard and features."
                buttonText="Sign In"
                linkPath="/"
            />
            <div className="login-form-wrapper">
                <div className="login-header">
                    <h2
                        style={{
                            fontWeight: "bold",
                            marginBottom: "10px",
                            padding: 0,
                        }}
                    >
                        Sign Up
                    </h2>
                </div>
                <Form
                    layout="vertical"
                    onFinish={onFinish}
                    style={{
                        margin: 0,
                        padding: 0,
                    }}
                >
                    <CustomInput
                        name="name"
                        placeholder="Name"
                        type="text"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Name!",
                            },
                        ]}
                    />
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
                        name="role"
                        placeholder="Register as"
                        type="select"
                        options={[
                            { value: "company", label: "Company/Admin" },
                            { value: "employee", label: "Employee" },
                        ]}
                        rules={[
                            {
                                required: true,
                                message: "Please select a user type",
                            },
                        ]}
                        onChange={onUserTypeChange}
                    />

                    {role === "company" && (
                        <div>
                            <CustomInput
                                name="company_name"
                                placeholder="Company Name"
                                type="text"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please input your company code!",
                                    },
                                ]}
                            />

                            <Flex
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "4%", // Adjust gap if needed for consistent spacing
                                }}
                            >
                                <CustomInput
                                    name="package"
                                    placeholder="Package"
                                    type="select"
                                    options={[
                                        { value: "basic", label: "Basic" },
                                        {
                                            value: "standard",
                                            label: "Standard",
                                        },
                                        { value: "premium", label: "Premium" },
                                    ]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a package",
                                        },
                                    ]}
                                />
                                <CustomInput
                                    name="plan"
                                    placeholder="Plan"
                                    type="select"
                                    options={[
                                        { value: "monthly", label: "Monthly" },
                                        { value: "yearly", label: "Yearly" },
                                    ]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a plan",
                                        },
                                    ]}
                                />
                            </Flex>

                            <CustomInput
                                name="card_number"
                                placeholder="Card Number"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter your card number",
                                    },
                                ]}
                            />
                            <CustomInput
                                name="card_owner_name"
                                placeholder="Owner Name"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter the owner's name",
                                    },
                                ]}
                            />

                            <Flex
                                style={{
                                    justifyContent: "space-between",
                                    gap: "4%",
                                }}
                            >
                                <CustomInput
                                    name="expiry_date"
                                    placeholder="Expiry Date"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Please enter the expiry date",
                                        },
                                    ]}
                                />
                                <CustomInput
                                    name="cvv"
                                    placeholder="CVV"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter the CVV",
                                        },
                                    ]}
                                />
                            </Flex>
                            <Flex
                                style={{
                                    justifyContent: "space-between",
                                    gap: "4%",
                                }}
                            >
                                <CustomInput
                                    name="password"
                                    placeholder="Password"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Please enter the Password",
                                        },
                                    ]}
                                />
                                <CustomInput
                                    name="password_confirmation"
                                    placeholder="Confirm Password"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter the CVV",
                                        },
                                    ]}
                                />
                            </Flex>
                        </div>
                    )}

                    {role === "employee" && (
                        <>
                            <CustomInput
                                name="password"
                                placeholder="Password"
                                type="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a password",
                                    },
                                ]}
                            />
                            <CustomInput
                                name="password_confirmation"
                                placeholder="Confirm Password"
                                type="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please confirm your password",
                                    },
                                ]}
                            />
                            <CustomInput
                                name="company_code"
                                placeholder="Company Code"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter your company code",
                                    },
                                ]}
                            />
                        </>
                    )}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="custom-button"
                            loading={loading}
                        >
                            Sign Up
                        </Button>
                    </Form.Item>
                    <div className="login-footer">
                        <p>
                            Already have an account? <a>Sign In</a>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Register;
