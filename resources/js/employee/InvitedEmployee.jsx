import React, { useEffect } from "react";
import { Table, Button, notification, Tooltip, Spin, Alert } from "antd";
import { MdCancelPresentation } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getInvitedUsers, cancelInvite } from "./redux/reducers";
import InvitedManagers from "../manager/InvitedManagers";
import Loading from "../Loading";

const InvitedEmployee = () => {
    const { error, loading, InvitedUsers } = useSelector(
        (state) => state.employee
    );
    const dispatch = useDispatch();

    // Fetch Invited Users
    const invitedEmployee = async () => {
        try {
            await dispatch(
                getInvitedUsers(localStorage.getItem("company_code"))
            );
        } catch (error) {
            notification.error({
                description: error || "Failed to get invited users.",
                duration: 1.5,
            });
        }
    };

    useEffect(() => {
        invitedEmployee();
    }, []); // Only fetch once on mount

    // Cancel Invite
    const handleCancelInvite = async (id) => {
        try {
            const response = await dispatch(cancelInvite(id));
            if (!response.error) {
                notification.success({
                    description: "Invite Cancelled Successfully",
                    duration: 1.5,
                });
                invitedEmployee(); // Refresh the list after canceling
            }
        } catch (error) {
            notification.error({
                description: error || "Failed to Cancel Invite",
                duration: 1.5,
            });
        }
    };

    // Table Columns
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
                            onClick={() => handleCancelInvite(record?.user_id)}
                            icon={<MdCancelPresentation />}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    // Show loading state
    if (loading) return <Loading/>;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    return (
        <>
            <h1>Invited Staff</h1>
            <InvitedManagers /> {/* Show Invited Managers */}
            <h4 style={{ textAlign: "center" }}>Employees</h4>
            <Table
                columns={columns} // Pass the columns here
                dataSource={InvitedUsers} // Pass the employee data here
                rowKey={(record) => record.user_id} // Ensure unique row key
                pagination={false} // Disable pagination for now
            />
        </>
    );
};

export default InvitedEmployee;
