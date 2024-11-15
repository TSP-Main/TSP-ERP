import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userData } from "./redux/reducer";
import "./styles/Dashboard.css"; // Importing the CSS file
import { MailOutlined, UserOutlined, IdcardOutlined } from "@ant-design/icons";

const Dashboard = () => {
    const { error, loading, userdata } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(userData());
        
    }, [dispatch]);
    
    return (
        <div className="dashboard-container">
            <div className="profile-card">
                <h1 className="profile-title">User Profile</h1>
                {loading && <p>Loading...</p>}
                {error && (
                    <p className="error-text">Error loading user data.</p>
                )}
                {!loading && !error && (
                    <div className="profile-details">
                        <div className="profile-detail">
                            <MailOutlined className="icon" />
                            <div>
                                <h3>Email</h3>
                                <p>{userdata?.data.email}</p>
                            </div>
                        </div>
                        <div className="profile-detail">
                            <UserOutlined className="icon" />
                            <div>
                                <h3>Name</h3>
                                <p>{userdata?.data.name}</p>
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
                                <IdcardOutlined className="icon" />
                                <div>
                                    <h3>Company code </h3>
                                    <p>
                                        {userdata?.data?.company?.code || "N/A"}
                                    </p>
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