import React, { useEffect } from "react";
import { Table, Button, notification, Tooltip,Spin,Alert } from "antd";
import { MdCancelPresentation } from "react-icons/md";
import { useDispatch } from "react-redux";
import { getInvitedUsers, cancelInvite } from "./redux/reducers";
import { useSelector } from "react-redux";
const InvitedEmployee = () => {
    const { error, loading, InvitedUsers } = useSelector(
        (state) => state.employee
    );
    console.log("invited", InvitedUsers);
    const dispatch = useDispatch();
    const handleCancelnvite = async (id) => {
        try {
            console.log("id cancel", id);
            const response = await dispatch(cancelInvite(id));
            console.log("response", response);
            if (!response.error) {
                notification.success({
                    description: "Invite Cancelled Successfully",
                    duration: 1.5,
                });
                invitedEmployee();
            }
        } catch (error) {
            notification.error({
                description: error || "Failed to Cancel Invite",
                duration: 1.5,
            });
        }
    };
    const invitedEmployee = async () => {
        try {
            const response = await dispatch(getInvitedUsers(localStorage.getItem("company_code")));
        } catch (error) {
            notification.error({
                description: error || "Failed to get users",
                duration: 1.5,
            });
        }
    };
    useEffect(() => {
        invitedEmployee();
    }, []);
    const columns = [
        {
            title: "Name",
            dataIndex: ["user", "name"],
            key: "companyName",
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "companyEmail",
        },
        // {
        //     title: "Company Code",
        //     dataIndex: ["employee", "company_code"],
        //     key: "companyCode",
        // },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip title="Cancel Invite">
                        <Button
                            style={{
                                border: "none",
                                background: "red",
                                color: "white",
                            }}
                            onClick={() => handleCancelnvite(record?.user_id)}
                            icon={<MdCancelPresentation />}
                        />
                    </Tooltip>
                    {/* <Button icon={<MdDelete />} /> */}
                </div>
            ),
        },
    ];
    if (loading) return <Spin size="large" tip="Loading..." />;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    return (
        <>
            <h1>Invited Employee</h1>
            <Table
                columns={columns} // Pass the columns here
                dataSource={InvitedUsers} // Pass the employee data here
                // rowKey={(record) => record.employee.company_code}
                pagination={false}
            />
        </>
    );
};


export default InvitedEmployee;
