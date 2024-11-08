import React, { useState } from "react";
import { Layout, Menu, Drawer, Button, Dropdown, Input } from "antd";
import "../styles/SideNav.css";
import { Link } from "react-router-dom";
import placeholder from "../../assests/placeholder-image.jpg";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiUsers } from "react-icons/fi";
import { MdAirplanemodeActive } from "react-icons/md";
import {
    SearchOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MenuOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { FaRegBuilding } from "react-icons/fa";
import useResponsive from "../../hooks/useResponsive";
import logo from "../../assests/tms_logo.png"; // Adjust the path if needed


const { Header, Sider } = Layout;
function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const items = [
    getItem("Dashboard", "1", <UserOutlined />),
    getItem("Company", "2", <FaRegBuilding />, [
        getItem(
            <Link to="/welcome/onboard">Onboard</Link>,
            "3",
            <MdAirplanemodeActive />
        ),
        getItem(
            <Link to="/welcome/inactive">New Request</Link>,
            "4",
            <IoMdNotificationsOutline />
        ),
    ]),
    // getItem("Employee", "5", <FiUsers />, <Link to={"/welcome/employee"} />),
    getItem(<Link to="/welcome/employee">Employee</Link>, "5", <FiUsers />),
];
const SideNav = () => {
    const [loadingLogout, setLoadingLogout] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const isSmallScreen = useResponsive(); // Detect screen size

    const handleDrawerOpen = () => setDrawerVisible(true);
    const handleDrawerClose = () => setDrawerVisible(false);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar for large screens */}
            {!isSmallScreen && (
                <Sider
                    style={{
                        backgroundColor: "#F5F5F58A",
                        borderRight: "1px solid #00000033",
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
                                // paddingLeft: collapsed ? "20px" : "70px",
                                // paddingTop: collapsed ? "20px" : "20px",
                                // paddingBottom: "10px",
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
                        // defaultSelectedKeys={["1"]}
                        mode="inline"
                        items={items}
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
                        alignItems: "center", // Horizontally center the content
                        height: "100vh", // Full-height to center vertically
                    }}
                >
                    <div
                        className="demo-logo-vertical"
                        style={{ marginBottom: "20px" }}
                    >
                        <img
                            src={logo}
                            alt="Logo"
                            style={{
                                width: "100px", // Adjust width as needed
                            }}
                        />
                    </div>
                    <Menu
                        style={{
                            backgroundColor: "#F5F5F58A",
                            color: "black",
                            width: "100%", // Take full width of Drawer
                        }}
                        theme="light"
                        mode="inline"
                        items={items}
                    />
                </Drawer>
            )}

            <Layout>
                <Header
                    style={{
                        // padding: 0,
                        background: "#fff",
                        position: "fixed",
                        left: isSmallScreen ? 0 : collapsed ? 90 : 210,
                        right: 0,
                        top: 0,
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        // padding: "0 16px",
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
                        <Input
                            style={{
                                maxWidth: "375px",
                                maxHeight: "58px",
                                borderRadius: "29px",
                                backgroundColor: "#D9D9D9",
                            }}
                            placeholder="Search"
                            prefix={<SearchOutlined />}
                        />

                        <div
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
                            <IoMdNotificationsOutline />
                        </div>
                        {/* Avatar */}
                        <img
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
                        />
                    </div>
                </Header>
            </Layout>
        </Layout>
    );
};

export default SideNav;
