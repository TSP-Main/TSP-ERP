import React, { useEffect } from "react";
import { Table,  notification} from "antd";

import { useDispatch, useSelector } from "react-redux";
import { gettCancelledInvitedManagers } from "./redux/reducer";




const InvitedCanceledManagers = () => {
    const dispatch = useDispatch();
    const { cancelInviteddata } = useSelector((state) => state.manager);

    useEffect(() => {
        fetchInvitedCanceledManagers();
    }, []);

    const fetchInvitedCanceledManagers = async () => {
        try {
            await dispatch(
                gettCancelledInvitedManagers(
                    localStorage.getItem("company_code")
                )
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
            <h4 style={{ textAlign: "center" }}>Managers</h4>
            <Table
                dataSource={cancelInviteddata}
                columns={columns}
                pagination={false}
            />
        </>
    );
};

export default InvitedCanceledManagers;
