import React, { useEffect } from "react";
import { Table, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { showSchedule } from "../redux/reducer";

const ScheduleTable = () => {
    const dispatch = useDispatch();
    const { error, loading, scheduledata } = useSelector(
        (state) => state.schedule
    );
    console.log("sche", scheduledata);

useEffect(() => {
    const id = localStorage.getItem("company_id");
    console.log("company id", id);
    dispatch(showSchedule(id));
   
    // Log the fetched data
    console.log("Fetched schedule data:", scheduledata);
}, [dispatch]);
    // Check if the data is properly structured
//    if (!Array.isArray(scheduledata)) {
//        console.error(
//            "scheduledata should be an array, received:",
//            typeof scheduledata,
//            scheduledata // log the actual value
//        );
//        return (
//            <Alert
//                message="Error"
//                description="Invalid data format. Data should be an array of objects."
//                type="error"
//                showIcon
//            />
//        );
//    }

    if (loading) return <h1>Loading...</h1>;

    if (error || !scheduledata || scheduledata.length === 0)
        return (
            <Alert
                message="Error"
                description={error || "No schedule data available."}
                type="error"
                showIcon
            />
        );

    return (
        <Table
            columns={columns}
            dataSource={scheduledata}
            pagination={false}
            rowKey="id"
        />
    );
};

export const columns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
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
    {
        title: "Total Hours",
        dataIndex: "total_hours",
        key: "total_hours",
        render: (text) => (text !== null ? text : "N/A"), // Handle null values
    },
    {
        title: "Week Day",
        dataIndex: "week_day",
        key: "week_day",
    },
];

export default ScheduleTable;
