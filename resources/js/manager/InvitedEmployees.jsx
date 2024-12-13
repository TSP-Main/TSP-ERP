import { notification, Table, Tooltip, Button, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getInvitedUsers } from "./redux/reducer";
import { MdCancelPresentation } from "react-icons/md";
import { cancelInvite } from "../employee/redux/reducers";

const Index = () => {
    const dispatch = useDispatch();
    const [inviteddata, setInvitedData] = useState([]);

    const fetchEmployees = async () => {
        const payload = {
            code: "CPM-67175A6A1BGKT",
            id: localStorage.getItem("manager_id"),
        };
        try {
            const response = await dispatch(getInvitedUsers(payload));
            setInvitedData(response.payload);
        } catch (error) {
            notification.error({
                message: error.response?.errors || "Failed to fetch data",
            });
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleCancelInvite = async (id) => {
        try {
            const response = await dispatch(cancelInvite(id));
            if (!response.error) {
                notification.success({
                    description: "Invite Cancelled Successfully",
                    duration: 1.5,
                });
                fetchEmployees(); // Refresh the list after canceling
            }
        } catch (error) {
            notification.error({
                description: error || "Failed to Cancel Invite",
                duration: 1.5,
            });
        }
    };

    const confirmCancelInvite = (id) => {
        Modal.confirm({
            title: "Cancel Invite",
            content: "Are you sure you want to cancel this invite?",
            okText: "Yes",
            okButtonProps: {
                style: {
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                },
            },
            cancelText: "No",
            onOk: () => handleCancelInvite(id),
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
            title: "Manager",
            dataIndex: ["manager", "user", "name"],
            key: "manager",
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
                            onClick={() => confirmCancelInvite(record?.user_id)}
                            icon={<MdCancelPresentation />}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <>
            <h1>Invited Employees</h1>
            <Table
                columns={columns}
                dataSource={inviteddata}
                rowKey={(record) => record.user_id}
            />
        </>
    );
};

export default Index;
