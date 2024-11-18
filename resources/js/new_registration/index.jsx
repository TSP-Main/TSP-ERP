import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Spin, Alert, Button, notification } from "antd";
import { inactiveEmployee } from "./redux/reducer";
import { approveUserAction,inactiveUsersData } from "../company/redux/reducer";
// import { useDispatch } from "react-redux";
// import { inactiveUsersData, approveUserAction } from "./redux/reducer";

const InActive = () => {
     const dispatched = useDispatch();
    const { error, loading, data } = useSelector(
        (state) => state.inactive
    );

    console.log("inactive seeee", data);
    const handleApprove = async (id) => {
        console.log("user id",id);
        try {
            // const id=localStorage.getItem("company_id")
            console.log("user id", id);
            // Dispatch the action to approve the user
            dispatched(approveUserAction(id));
            console.log("inside try");
            notification.success({
                message: "Success",
                description: "User approved successfully.",
                duration: 3,
            });
            window.location.reload();

            // Optionally refresh the inactive users data
            dispatched(inactiveUsersData());
        } catch (error) {
            notification.error({
                message: "Error",
                description: error || "Failed to approve user.",
                duration: 3,
            });
        }
    };
    useEffect(()=>{
        const code = localStorage.getItem("company_code");
      const response=dispatched(inactiveEmployee(code))
      console.log("In active employee dispatch",response)

    },[dispatched])

    // Define table columns
    const columns = [
        {
            title: "Employee Name",
            dataIndex: ["user", "name"], // Access nested 'name' in 'company'
            key: "name",
        },
        {
            title: " Email",
            dataIndex: ["user", "email"], // Access 'email' directly from main object
            key: "Email",
        },
        {
            title: "Company Code",
            dataIndex: "company_code", // Access nested 'code' in 'company'
            key: "companyCode",
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <Button type="primary" onClick={() => handleApprove(record?.user_id)}>
                    Approve
                </Button>
            ),
        },
    ];

    // if (loading)
    //     return (
    //         <Spin
    //             tip="Loading data..."
    //             size="large"
    //             style={{
    //                 alignContent: "center",
    //             }}
    //         />
    //     );

    // if (error)
    //     return (
    //         <Alert message="Error" description={error} type="error" showIcon />
    //     );

    return (
        <div>
            <h1>New Request</h1>
            <Table
                columns={columns}
                 dataSource={data}
                rowKey={(record) => record.id} // Use 'company.code' as unique key
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default InActive;
