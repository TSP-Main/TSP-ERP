import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Spin, Alert } from "antd";
import { activeUsersData } from "./redux/reducer";


const OnBoard = () => {
    const dispatch = useDispatch();
    const { error, loading, onboarddata } = useSelector(
        (state) => state.company
    );

    useEffect(() => {
        console.log('OnBoard')
        dispatch(activeUsersData());
    }, []);

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
    ];

    if (loading) return <Spin tip="Loading data..." />;
    if (error)
        return (
            <Alert
                message="Error"
                description="Failed to load company data."
                type="error"
                showIcon
            />
        );

    return (
        <div>
            <h1>On Board</h1>
            <Table
                pagination={false}
                columns={columns}
                dataSource={onboarddata}
                rowKey={(record) => record.company.code} // Use 'company.code' as unique key
                // pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default OnBoard;
