import React, { useState } from "react";
import CustomInput from "../components/CustomInput";
import { Button, Form, Flex, notification } from "antd";
import logo from '../assests/tms_logo.png';
import "../Register/styles/register.css";

const CreatePassword = () => {
 

    const onFinish = async (values) => {
       
    };

    // const { register, handleSubmit,formState:{ errors} } = useForm();
    return (
        <div className="login-container">
            <div className="login-form-wrapper">
                <div className="demo-logo-vertical">
                    <img
                        src={logo}
                        alt="Logo"
                    />
                </div>
                <div className="login-header">
                    <h2
                        style={{
                            fontWeight: "bold",
                            marginBottom: "10px",
                            padding: 0,
                        }}
                    >
                        Create Password
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
                        name="email"
                        placeholder="Email"
                        type="email"
                        rules={[
                            {
                                required: true,
                                message: "Please input your email!",
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
                                message: "Please input your Email!",
                            },
                        ]}
                    />
                    <CustomInput
                        name="confirm_password"
                        placeholder="Confirm Password"
                        type="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Email!",
                            },
                        ]}
                    />

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="custom-button"
                        >
                            Create Password
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default CreatePassword;
