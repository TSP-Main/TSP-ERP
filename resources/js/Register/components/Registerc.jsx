import React, { useState } from "react";
import CustomInput from "../../components/CustomInput";
import { Button, Form, notification } from "antd";
import WelcomePage from "../../components/WelcomePage";
import "../styles/register.css";
import { useDispatch, useSelector } from "react-redux";
import { SignUp } from "../../auth/redux/loginReducer";

const Register = () => {
    const [form] = Form.useForm();
    const [role, setUserType] = useState(null);

    const dispatch = useDispatch();
    const { error, loading } = useSelector((state) => state.auth);

    const onUserTypeChange = (value) => {
        setUserType(value);
    };

    const onFinish = async (values) => {
        const response = await dispatch(SignUp(values));
        console.log("response", response, error);
        if (response.error) {
            notification.error({
                message: "Error",
                description: response.payload || "Registration failed",
            });
            return;
        }
    };

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
                    form={form}
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
                                message: "Please input your Email!", // Message for required field
                            },
                            {
                                pattern:
                                    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Email pattern
                                message: "Please enter a valid email address!", // Custom message for invalid email format
                            },
                        ]}
                    />

                    {/* FlexBox Wrapper for Password Fields */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "4%",
                        }}
                    >
                        <CustomInput
                            name="password"
                            placeholder="Password"
                            type="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter the Password",
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
                                    message: "Please confirm your Password",
                                },
                                {
                                    validator: (_, value) => {
                                        const password =
                                            form.getFieldValue("password");
                                        if (value && value !== password) {
                                            return Promise.reject(
                                                "The two passwords do not match!"
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        />
                    </div>

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

                    {/* Conditional Fields for Company */}
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
                                            "Please input your company name!",
                                    },
                                ]}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "4%",
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
                            </div>
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
                            <div
                                style={{
                                    display: "flex",
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
                            </div>
                        </div>
                    )}

                    {/* Conditional Fields for Employee */}
                    {role === "employee" && (
                        <CustomInput
                            name="company_code"
                            placeholder="Company Code"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your company code",
                                },
                            ]}
                        />
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
                            Already have an account?{" "}
                            <a href="/login">Sign In</a>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Register;
