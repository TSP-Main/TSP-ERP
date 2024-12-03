import React, { Suspense } from "react";
import { Row, Col } from "antd";
import AppSideNav from "../sidenav/index.jsx";
import { Outlet } from "react-router-dom";
import "./DefaultLayout.css"; // Import CSS for styling

const DefaultLayout = () => {
    return (
        <div className="layoutContainer">
            <Row className="layoutRow">
                {/* <Col className="sidebarCol"> */}
                    <AppSideNav />
                    
                {/* </Col> */}
{/* 
                <Col className="contentCol" style={{ paddingTop: "80px"}}>
                    <Outlet />
                </Col> */}
            </Row>
        </div>
    );
};

export default DefaultLayout;
