import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import { getChangeRequest } from "./redux/reducer"; // Import your async thunk

const ChangeShift = () => {
    const dispatch = useDispatch();
    const { changeRequestData,loading } = useSelector((state) => state.schedule);
    console.log("data", changeRequestData);
    

    useEffect(() => {
        // Dispatch the action to fetch data when the component mounts
        dispatch(getChangeRequest(localStorage.getItem("company_code")));
    }, [dispatch]);

    // Define the table columns
    const columns = [
        {
            title: "Employee Name",
            dataIndex: "employee_name",
            key: "employee_name",
        },
        {
            title: "Employee Email",
            dataIndex: "employee_email",
            key: "employee_email",
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Start Time",
            dataIndex: "start_time",
            key: "start_time",
        },
        {
            title: "End Time",
            dataIndex: "end_time",
            key: "end_time",
        },
    ];

    // Data mapping from the API response
    const data = changeRequestData?.map((item) => ({
        key: item.employee_id, // Unique key for each record
        employee_name: item.employee_name,
        employee_email: item.employee_email,
        date: item.date,
        start_time: item.start_time,
        end_time: item.end_time,
    }));

    return (
        <div>
            <h1>Change Shift</h1>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading} // Show loading state while fetching data
                pagination={false} // Disable pagination, or configure as needed
            />
        </div>
    );
};

export default ChangeShift;
