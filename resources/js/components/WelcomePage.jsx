import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import styles from "../styles/WelcomePage.module.css"; // Import the CSS Module

const WelcomePage = ({
    title = "Hello, Friend",
    description = "Enter your personal details and start your journey with us",
    buttonText = "Sign Up",
    linkPath = "/register",
    containerStyle = {},
}) => {
    return (
        <div className={styles.box2} style={containerStyle}>
            <h1 className={styles.title} style={{ textAlign: "center" }}>
                {title}
            </h1>
            <p className={styles.paragraph}>{description}</p>
            <Link to={linkPath} style={{ textDecoration: "none" }}>
                <Button
                    className={styles.customButton} // Use styles from CSS Module
                    style={{
                        backgroundColor: "transparent",
                        border: "1px solid #fff",
                    }}
                    size="large"
                    htmlType="button"
                    type="primary"
                >
                    {buttonText}
                </Button>
            </Link>
        </div>
    );
};

export default WelcomePage;
