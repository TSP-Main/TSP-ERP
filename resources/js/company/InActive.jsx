import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Spin, Alert,Button,notification } from "antd";
import { inactiveUsersData,approveUserAction } from "./redux/reducer";


const InActive = () => {
    const dispatched = useDispatch();
    const { error, loading, inactivedata } = useSelector(
        (state) => state.company
    );
    const handleApprove = async (id) => {
        console.log(id);
        try {
             console.log('inside try');
            // Dispatch the action to approve the user
            dispatched(approveUserAction(id));
            notification.success({
                message: "Success",
                description: "User approved successfully.",
            });

            // Optionally refresh the inactive users data
            dispatched(inactiveUsersData());
           
        } catch (error) {
            notification.error({
                message: "Error",
                description: error || "Failed to approve user.",
            });
        }
    };

    useEffect(() => {
        console.log("useeffect inactive")
        dispatched(inactiveUsersData())
         console.log("errors", error);
        if (error) {
            notification.error({
                message: "Error",
                description: error || "Login failed",
            });
            return;
        }
    }, []);

    console.log("inactiveUsersData",inactivedata)

    // Define table columns
    const columns = [
        {
            title: "Company Name",
            dataIndex: ["company", "name"], // Access nested 'name' in 'company'
            key: "companyName",
        },
        {
            title: "Company Email",
            dataIndex: "email", // Access 'email' directly from main object
            key: "companyEmail",
        },
        {
            title: "Company Code",
            dataIndex: ["company", "code"], // Access nested 'code' in 'company'
            key: "companyCode",
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <Button type="primary" onClick={() => handleApprove(record.id)}>
                    Approve
                </Button>
            ),
        },
    ];

    if (loading) return <Spin tip="Loading data..." size="large" style={{
        alignContent: "center"
    }}/>;
   
    if (error)
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
            />
        );

    return (
        <div>
            <h1>New Request</h1>
            <Table
                columns={columns}
                dataSource={inactivedata}
                rowKey={(record) => record.id} // Use 'company.code' as unique key
                pagination={{ pageSize: 10 }}
              
            />
        </div>
    );
};

export default InActive;
