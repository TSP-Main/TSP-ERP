import React, { useState } from "react";
import CustomInput from "../../components/CustomInput";
import { Button, Form, notification } from "antd";
import WelcomePage from "../../components/WelcomePage";
import styles from "../styles/Register.module.css"; // Import CSS Module
import { useDispatch, useSelector } from "react-redux";
import { getPrice, SignUp } from "../../auth/redux/loginReducer";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../../stripe";
import axios from "../../services/axiosService";

const Register = () => {
    const [form] = Form.useForm();
    const [role, setUserType] = useState(null);
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const { error, loading } = useSelector((state) => state.auth);

    const onUserTypeChange = (value) => {
        setUserType(value);
    };

  const onFinish = async (values) => {
      if (role === "company" && stripe && elements) {
          try {
              // Step 1: Get price and client_secret
            //   const response = await dispatch(
            //       getPrice({
            //           package: values.package,
            //           plan: values.plan,
            //           name: values.name,
            //           email: values.email,
            //       })
            //   );

            //   if (!response.payload || !response.payload.data.client_secret) {
            //       notification.error({
            //           message: "Error",
            //           description: "Failed to fetch payment details",
            //           duration: 3,
            //       });
            //       return;
            //   }
            //   console.log("register ", response.payload.data)
            //   const customer_id = response.payload.data.customer_id;
            //   const clientSecret = response.payload.data.client_secret;
            //   console.log("Client Secret:", clientSecret);

           console.log("Step 2: Confirm payment"); 
             const cardElement = elements.getElement(CardElement);
             const responsestripe = await stripe.createPaymentMethod({
                 type: "card",
                 card: cardElement,
                 billing_details: {
                     name: values.name,
                     email: values.email,
                 },
             });
             

              if (responsestripe.error) {
                  notification.error({
                      message: "Payment Error",
                      description: result.error.message,
                      duration: 3,
                  });
                  return;
              }

              // Step 3: Use payment method ID for registration
              const paymentMethodId = responsestripe.paymentMethod.id;
             
              console.log(
                  "Payment Method ID:",
                  responsestripe.paymentMethod.id
              );

              const registrationData = {
                  role: values.role,
                  name: values.name,
                  email: values.email,
                  password: values.password,
                  password_confirmation: values.password_confirmation,
                  company_name: values.company_name,
                  package: values.package,
                  plan: values.plan,
                
                  payment_method_id: paymentMethodId,
              };

            //   const registrationResponse = await dispatch(
            //       SignUp(registrationData)
            //   );

            //   if (registrationResponse.error) {
            //       notification.error({
            //           message: "Registration Error",
            //           description:
            //               registrationResponse.payload ||
            //               "Registration failed due to server error",
            //           duration: 3,
            //       });
            //       return;
            //   }

              notification.success({
                  message: "Registration Successful",
                  description:
                      "You have successfully registered. Please wait for approval.",
                  duration: 3,
              });
          } catch (error) {
              notification.error({
                  message: "Error",
                  description: error.message || "An unexpected error occurred.",
                  duration: 3,
              });
          }
      } else {
          // Employee registration logic (without payment)
          try {
              const response = await dispatch(SignUp(values));
              if (response.error) {
                  notification.error({
                      message: "Registration Error",
                      description: response.payload || "Registration failed",
                      duration: 3,
                  });
                  return;
              }

              notification.success({
                  message: "Registration Successful",
                  description:
                      "You have successfully registered. Please wait for approval.",
                  duration: 3,
              });
          } catch (error) {
              notification.error({
                  message: "Error",
                  description: error.message || "An unexpected error occurred.",
                  duration: 3,
              });
          }
      }
  };



    return (
        <div className={styles.loginContainer}>
            <WelcomePage
                containerStyle={{height: '450px',borderRadius: '8px 0px 0px 8px'}}
                title="Hello Friend"
                description="Sign In to access your personalized dashboard and features."
                buttonText="Sign In"
                linkPath="/"
            />
            <div className={styles.loginFormWrapper}>
                <div>
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
                                message: "Please input your Email!",
                            },
                            {
                                pattern:
                                    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                message: "Please enter a valid email address!",
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
                            {/* Stripe Card Input */}
                            <CardElement options={{ hidePostalCode: true }} />
                        </div>
                    )}

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
                            className={styles.customButton}
                            loading={loading}
                        >
                            Sign Up
                        </Button>
                    </Form.Item>
                    <div className={styles.loginFooter}>
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

export default () => (
    <Elements stripe={stripePromise}>
        <Register />
    </Elements>
);
