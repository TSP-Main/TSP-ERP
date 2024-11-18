import React, { useEffect } from "react";
import { Table, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { showSchedule } from "../redux/reducer";

const ScheduleTable = () => {
    const dispatch = useDispatch();
    const { error, loading, scheduledata } = useSelector(
        (state) => state.schedule
    );

    useEffect(() => {
        const id = localStorage.getItem("company_id");
        dispatch(showSchedule(id));
    }, [dispatch]);

    // Ensure scheduledata is an array
    const dataSource = Array.isArray(scheduledata) ? scheduledata : [];

    // Debugging logs
    console.log("Final data for table:", dataSource);

    if (loading) return <h1>Loading...</h1>;

    if (error || !dataSource || dataSource.length === 0)
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
            dataSource={dataSource}
            pagination={false}
            rowKey="id"
        />
    );
};
const columns = [
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

];

export default ScheduleTable;
