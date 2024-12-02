// SideNav.jsx
import React, { useState, useEffect } from "react";
import { Layout, Menu, Drawer, Button, Dropdown, notification } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { IoLogOut,IoPersonAdd } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
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
// import "../styles/SideNav.css";
import apiRoutes from "../../routes/apiRoutes";
import axios from "../../services/axiosService";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../auth/redux/loginReducer";
const { Header, Sider, Content, Footer } = Layout;

const SideNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const isSmallScreen = useResponsive();
    const [loading, setLoading] = useState(false);
    const handleDrawerOpen = () => setDrawerVisible(true);
    const handleDrawerClose = () => setDrawerVisible(false);
    const currentPath = location.pathname;
    const handleLogout = async () => {
        try {
            setLoading(true);
            await dispatch(logout());
            navigate("/login");
            window.location.reload();
        } catch (error) {
            setLoading(false);
            notification.error({
                message: "Error",
                description: error.response?.data?.message || "Logout failed",
                duration: 3,
            });
        }
    };
    const handleRegister = () => {
        navigate("/register");
    }
    const profilemenu = (
        <Menu>
            <Menu.Item key="/profile">
                <Link to="/profile">
                    <FaUser style={{ marginRight: "5px" }} />
                    Profile
                </Link>
            </Menu.Item>
            <Menu.Item key="/register">
                <Link to="/register" onClick={handleRegister}>
                    <IoPersonAdd  style={{ marginRight: "5px" }} />
                    Sign Up
                </Link>
            </Menu.Item>
            <Menu.Item key="/logout">
                <Link to="/logout" onClick={handleLogout}>
                    <IoLogOut style={{ marginRight: "5px" }} />
                    Logout
                </Link>
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout style={{ minHeight: "100vh", backgroundColor: "#F5F5F58A" }}>
            {!isSmallScreen && (
                <div>
                    <Sider
                        style={{
                            backgroundColor: "#F5F5F58A",
                            height: "100vh",
                            position: "fixed",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            display: "flex",
                            flexDirection: "column", // Use flexbox to structure the sidebar
                            justifyContent: "space-between", // Space between items to push footer to the bottom
                            alignItems: "center",
                            overflowY: "auto",
                        }}
                        width={290}
                        collapsedWidth={80}
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        theme="light"
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                backgroundColor: "#F5F5F58A",
                            }}
                        >
                            <div className="Content Nav">
                                <div className="demo-logo-vertical">
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        style={{
                                            paddingLeft: collapsed
                                                ? "20px"
                                                : "70px",
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
                                        border: "none",
                                    }}
                                    theme="light"
                                    mode="inline"
                                    selectedKeys={[currentPath]}
                                    items={RoleBasedMenu()}
                                    onClick={handleDrawerClose}
                                />
                            </div>
                            <div>
                                <footer
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor: "#F5F5F58A",
                                        color: "black",
                                        padding: "10px",
                                        textAlign: "center",
                                    }}
                                >
                                    © 2024{" "}
                                    <span
                                        style={{
                                            fontWeight: "bold",
                                            color: "#00a8a8;",
                                        }}
                                    >
                                        <a href="https://techsolutionspro.co.uk/">
                                            Tech Solutions Pro
                                        </a>
                                    </span>{" "}
                                    All Rights Reserved
                                </footer>
                            </div>
                        </div>
                    </Sider>
                </div>
            )}

            {isSmallScreen && (
                <Drawer
                    placement="left"
                    closable={false}
                    onClose={handleDrawerClose}
                    open={drawerVisible}
                    styles={{
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
                        onClick={handleDrawerClose}
                    />
                </Drawer>
            )}

            <Layout
                style={{
                    marginLeft: isSmallScreen ? 0 : collapsed ? 80 : 200,
                }}
            >
                <Header
                    style={{
                        padding: 0,
                        background: "white",
                        position: "fixed",
                        left: isSmallScreen ? 0 : collapsed ? 80 : 290,
                        right: 0,
                        top: 0,
                        zIndex: 2,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingLeft: isSmallScreen ? "8px" : "16px",
                        paddingRight: isSmallScreen ? "8px" : "16px",
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
                        {/* <Button
                            loading={loading}
                            onClick={() => handleLogout()}
                        >
                            Log out
                        </Button> */}
                        <Dropdown
                            overlay={profilemenu}
                            trigger={["click"]}
                            style={{ cursor: "pointer", marginRight: "45px" }}
                        >
                            <img
                                src={placeholder}
                                alt="User Avatar"
                                style={{
                                    border: "1px solid #00000033",
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                }}
                            />
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ margin: "64px 16px", overflow: "auto" }}>
                    {/* Your content goes here */}
                </Content>

                {/* <Content
                    style={{
                        margin: "24px 16px 0",
                        overflow: "initial",
                    }}
                >
                    <div
                        style={{
                            padding: 24,
                            textAlign: "center",
                        }}
                    >
                        <Outlet />
                    </div>
                </Content> */}
            </Layout>
        </Layout>
    );
};

export default SideNav;
