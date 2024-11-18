// SideNav.jsx
import React, { useState,useEffect } from "react";
import { Layout, Menu, Drawer, Button, Input, notification } from "antd";
import { Link,useNavigate } from "react-router-dom";
import {
    SearchOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import RoleBasedMenu from "../services/RoleBasedMenu"; // Import RoleBasedMenu component
import useResponsive from "../../hooks/useResponsive";
import logo from "../../assests/tms_logo.png";
import placeholder from "../../assests/placeholder-image.jpg";
import "../styles/SideNav.css";
import apiRoutes from "../../routes/apiRoutes";
import axios from "../../services/axiosService";
import { useLocation } from "react-router-dom";
const { Header, Sider } = Layout;


const SideNav = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const isSmallScreen = useResponsive();
    const  [loading, setLoading] = useState(false);
    const handleDrawerOpen = () => setDrawerVisible(true);
    const handleDrawerClose = () => setDrawerVisible(false);
     const currentPath = location.pathname;
   useEffect(() => {
       console.log("Current Path: ", currentPath); // Debugging line
   }, [currentPath]);
    const handleLogout = async () => {
        try {
            setLoading(true)
            const response = await axios.post(apiRoutes.logout);
            localStorage.clear();
            sessionStorage.clear();
            // window.location.href = "/";
            navigate('/login')
            setLoading(false);
        } catch (error) {
            setLoading(false);
            notification.error({
                message: "Error",
                description: error.response?.data?.message || "Logout failed",
                duration: 3,
            });
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", backgroundColor: "#F5F5F58A" }}>
            {!isSmallScreen && (
                <Sider
                    style={{
                        backgroundColor: "#F5F5F58A",
                        // borderRight: "1px solid #00000033",
                    }}
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    theme="light"
                >
                    <div className="demo-logo-vertical">
                        <img
                            src={logo}
                            alt="Logo"
                            style={{
                                paddingLeft: collapsed ? "20px" : "70px",
                                paddingTop: "20px",
                                paddingBottom: "10px",
                                width: collapsed ? "70px" : "130px",
                            }}
                        />
                    </div>
                    <Menu
                        style={{
                            backgroundColor: "#F5F5F58A",
                            color: "black",
                        }}
                        theme="light"
                        mode="inline"
                        selectedKeys={[currentPath]}
                        items={RoleBasedMenu()} // Use RoleBasedMenu directly
                    />
                </Sider>
            )}

            {isSmallScreen && (
                <Drawer
                    placement="left"
                    closable={false}
                    onClose={handleDrawerClose}
                    visible={drawerVisible}
                    bodyStyle={{
                        backgroundColor: "#F5F5F58A",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100vh",
                    }}
                >
                    <div
                        className="demo-logo-vertical"
                        style={{ marginBottom: "20px" }}
                    >
                        <img src={logo} alt="Logo" style={{ width: "100px" }} />
                    </div>
                    <Menu
                        style={{
                            backgroundColor: "#F5F5F58A",
                            color: "black",
                            width: "100%",
                        }}
                        theme="light"
                        mode="inline"
                        selectedKeys={[currentPath]}
                        items={RoleBasedMenu()}
                    />
                </Drawer>
            )}

            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: "#fff",
                        position: "fixed",
                        left: isSmallScreen ? 0 : collapsed ? 90 : 210,
                        right: 0,
                        top: 0,
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 16px",
                    }}
                >
                    {isSmallScreen ? (
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={handleDrawerOpen}
                        />
                    ) : (
                        <Button
                            type="text"
                            icon={
                                collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    )}

                    <div
                        style={{
                            flexGrow: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "16px",
                            alignItems: "center",
                        }}
                    >
                        {/* <Input
                            style={{
                                maxWidth: "375px",
                                maxHeight: "58px",
                                borderRadius: "29px",
                                backgroundColor: "#D9D9D9",
                            }}
                            placeholder="Search"
                            prefix={<SearchOutlined />}
                        /> */}
                        {/* <div
                            style={{
                                width: "35px",
                                height: "35px",
                                backgroundColor: "#D9D9D9",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                            }}
                        >
                            <MenuOutlined />
                        </div> */}
                        <Button
                            loading={loading}
                            onClick={() => handleLogout()}
                        >
                            Log out
                        </Button>
                        {/* <img
                            src={placeholder}
                            alt="User Avatar"
                            style={{
                                border: "1px solid #00000033",
                                width: "35px",
                                height: "35px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                cursor: "pointer",
                            }}
                        /> */}
                    </div>
                </Header>
            </Layout>
        </Layout>
    );
};

export default SideNav;
