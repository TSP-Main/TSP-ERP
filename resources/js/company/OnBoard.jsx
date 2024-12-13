import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Spin, Alert } from "antd";
import { activeUsersData } from "./redux/reducer";
import Loading from "../Loading";


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
            title: "Name",
            dataIndex: ["company", "name"], // Access nested 'name' in 'company'
            key: "companyName",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.company?.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.company?.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Email",
            dataIndex: "email", // Access 'email' directly from main object
            key: "companyEmail",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },

        {
            title: "Company Code",
            dataIndex: ["company", "code"], // Access nested 'code' in 'company'
            key: "companyCode",
        },
    ];

    if (loading) return <Loading/>;
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
