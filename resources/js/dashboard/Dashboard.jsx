import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userData } from "./redux/reducer";
import "./styles/Dashboard.css"; // Importing the CSS file
import {
    MailOutlined,
    UserOutlined,
    IdcardOutlined,
    BarcodeOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import { Button, notification } from "antd";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { error, loading, userdata } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Fetch user data on component mount
    useEffect(() => {
        dispatch(userData());
    }, [dispatch]);

    // Logout and clear storage
    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
    };

    // Copy Company Code to Clipboard
    const handleCopyCompanyCode = () => {
        const companyCode = userdata?.data?.company?.code;
        if (companyCode) {
            navigator.clipboard
                .writeText(companyCode)
                .then(() => {
                    notification.success({
                        message: "Copied to Clipboard!",
                        description: `Company code "${companyCode}" has been copied.`,
                        duration: 2,
                    });
                })
                .catch((err) => {
                    console.error("Failed to copy text: ", err);
                    notification.error({
                        message: "Copy Failed",
                        description: "Unable to copy the company code.",
                        duration: 2,
                    });
                });
        } else {
            notification.warning({
                message: "No Company Code",
                description: "No company code is available to copy.",
                duration: 2,
            });
        }
    };

    if (!userdata) {
        return (
            <div className="dashboard-container">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="profile-card">
                <h1 className="profile-title">User Profile</h1>

                {/* Loading State */}
                {loading && <p>Loading...</p>}

                {/* Error State */}
                {error && (
                    <div className="error-container">
                        <p className="error-text">Error loading user data.</p>
                        <Button type="primary" onClick={handleLogout}>
                            Login
                        </Button>
                    </div>
                )}

                {/* User Details */}
                {!loading && !error && userdata && (
                    <div className="profile-details">
                        <div className="profile-detail">
                            <MailOutlined className="icon" />
                            <div>
                                <h3>Email</h3>
                                <p>{userdata?.data?.email || "N/A"}</p>
                            </div>
                        </div>
                        <div className="profile-detail">
                            <UserOutlined className="icon" />
                            <div>
                                <h3>Name</h3>
                                <p>{userdata?.data?.name || "N/A"}</p>
                            </div>
                        </div>
                        <div className="profile-detail">
                            <IdcardOutlined className="icon" />
                            <div>
                                <h3>Role</h3>
                                <p>
                                    {userdata?.data?.roles?.[0]?.name || "N/A"}
                                </p>
                            </div>
                        </div>
                        {userdata?.data?.company?.code && (
                            <div className="profile-detail">
                                <BarcodeOutlined className="icon" />
                                <div>
                                    <h3>Company Code</h3>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            flexGrow: 1,
                                            alignContent:'center',
                                            alignItems:'center'
                                        }}
                                    >
                                        <p>
                                            {userdata?.data?.company?.code ||
                                                "N/A"}
                                        </p>

                                        <Button
                                            type="link"
                                            icon={<CopyOutlined />}
                                            onClick={handleCopyCompanyCode}
                                        />
                                            
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
