import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";

const WelcomePage = ({
    title = "Hello, Friend",
    description = "Enter your personal details and start your journey with us",
    buttonText = "Sign Up",
    linkPath = "/register",
}) => {
    return (
        <div className="box2">
            <h1>{title}</h1>
            <p className="paragraph">{description}</p>
            <Link to={linkPath} style={{ textDecoration: "none" }}>
                <Button
                    className="custom-button"
                    style={{
                        backgroundColor: "transparent",
                        border: "1px solid #fff",
                    }}
                    size="large"
                    htmlType="button"
                    type="primary"
                    // htmlType="submit"
                    // size="large"
                    // className="custom-button"
                    // loading={loading}
                >
                    {buttonText}
                </Button>
            </Link>
        </div>
    );
};

export default WelcomePage;
