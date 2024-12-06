import React, { useEffect } from "react";
import { Table, notification } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { gettCancelledInvitedEmployees } from "./redux/reducer";

const InvitedCanceledEmployee = () => {
    const dispatch = useDispatch();
    const { cancelinvitedemployeedata } = useSelector((state) => state.manager);
    console.log("cancelinvitedemployeedata", cancelinvitedemployeedata);
    useEffect(() => {
        fetchInvitedCanceledEmployee();
    }, []);

    const fetchInvitedCanceledEmployee = async () => {
        try {
            const payload={
                code: localStorage.getItem("company_code"),
               id: localStorage.getItem("manager_id"),
            }
            await dispatch(
                gettCancelledInvitedEmployees(payload)
            );
        } catch (error) {
            notification.error({
                message: "Error",
                description: error || "Failed to fetch invited managers.",
                duration: 2,
            });
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: ["user", "name"],
            key: "name",
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
        },
    ];

    return (
        <>
            <Table
                dataSource={cancelinvitedemployeedata}
                columns={columns}
                pagination={false}
            />
        </>
    );
};

export default InvitedCanceledEmployee
