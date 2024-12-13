import React, { useEffect } from "react";
import { Table, Tooltip, Button, notification, Modal } from "antd";
import { MdCancelPresentation } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { gettinvitedManager } from "./redux/reducer";
import { cancelInvite } from "../employee/redux/reducers";

const { confirm } = Modal;

const InvitedManagers = () => {
    const dispatch = useDispatch();
    const { invitedmanagerdata } = useSelector((state) => state.manager);

    useEffect(() => {
        fetchInvitedManagers();
    }, []);

    const fetchInvitedManagers = async () => {
        try {
            await dispatch(
                gettinvitedManager(localStorage.getItem("company_code"))
            );
        } catch (error) {
            notification.error({
                message: "Error",
                description: error || "Failed to fetch invited managers.",
                duration: 2,
            });
        }
    };

    const handleCancelInvite = (id) => {
        confirm({
            title: "Cancel Invite",
            content: "Are you sure you want to cancel this invite?",
            okText: "Yes",
            cancelText: "No",
            onOk: async () => {
                try {
                    const response = await dispatch(cancelInvite(id));
                    if (!response.error) {
                        notification.success({
                            description: "Invite canceled successfully.",
                            duration: 1.5,
                        });
                        fetchInvitedManagers();
                    }
                } catch (error) {
                    notification.error({
                        description: error || "Failed to cancel invite.",
                        duration: 1.5,
                    });
                }
            },
        });
    };

    const columns = [
        {
            title: "Name",
            dataIndex: ["user", "name"],
            key: "name",
             defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
             defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip title="Cancel Invite" trigger="hover">
                        <Button
                            style={{
                                border: "none",
                                background: "red",
                                color: "white",
                            }}
                            onClick={() => handleCancelInvite(record?.user_id)}
                            icon={<MdCancelPresentation />}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <>
           
        </>
    );
};

export default InvitedManagers;
