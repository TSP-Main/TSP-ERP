import React, { useState } from "react";
import { Table, TimePicker, Button, notification } from "antd";
import moment from "moment";
import axios from "axios";
import { postEmployeeAvailability } from "./redux/reducer";
import { useDispatch } from "react-redux";

const Availibility = () => {
    const dispatch = useDispatch();
    const generateDates = () => {
        const dates = [];
        const today = moment();

        for (let i = 0; i < 7; i++) {
            const date = moment(today).add(i, "days");
            dates.push({
                key: i.toString(),
                date: date.format("YYYY-MM-DD"),
                displayDate: date.format("dddd, MMM DD"),
                startTime: null,
                endTime: null,
            });
        }
        return dates;
    };

    const [data, setData] = useState(generateDates());

    const handleTimeChange = (time, key, timeType) => {
        setData((prevData) =>
            prevData.map((item) =>
                item.key === key ? { ...item, [timeType]: time } : item
            )
        );
    };

    const handleSave = async (day) => {
        // if (!employeeId) {
        //     alert("Employee ID not found in localStorage.");
        //     return;
        // }
        const role = localStorage.getItem("role");
        let payload = {};
        if (role == "employee") {
            const employeeId = localStorage.getItem("employee_id");

            payload = {
                employee_id: employeeId,
                date: day.date,
                start_time: day.startTime
                    ? day.startTime.format("HH:mm")
                    : null,
                end_time: day.endTime ? day.endTime.format("HH:mm") : null,
            };
        } else {
            const employeeId = localStorage.getItem("manager_id");
            payload = {
                manager_id: employeeId,
                date: day.date,
                start_time: day.startTime
                    ? day.startTime.format("HH:mm")
                    : null,
                end_time: day.endTime ? day.endTime.format("HH:mm") : null,
            };
        }

        console.log("payload", payload);
        try {
            const response = await dispatch(
                postEmployeeAvailability(payload)
            ).unwrap(); // Use `.unwrap()` for cleaner error handling
            notification.success({
                description:
                    response?.message || "Schedule created successfully",
                duration: 3,
            });
        } catch (error) {
            console.log(error);
            notification.error({
                description: error || "Something went wrong. Please try again.",
                duration: 3,
            });
        }
    };

    const columns = [
        {
            title: "Date",
            dataIndex: "displayDate",
            key: "displayDate",
        },
        {
            title: "Start Time",
            dataIndex: "startTime",
            key: "startTime",
            render: (text, record) => (
                <TimePicker
                    format={"HH:mm"}
                    value={record.startTime}
                    onChange={(time) =>
                        handleTimeChange(time, record.key, "startTime")
                    }
                />
            ),
        },
        {
            title: "End Time",
            dataIndex: "endTime",
            key: "endTime",
            render: (text, record) => (
                <TimePicker
                    format={"HH:mm"}
                    value={record.endTime}
                    onChange={(time) =>
                        handleTimeChange(time, record.key, "endTime")
                    }
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <Button type="primary" onClick={() => handleSave(record)}>
                    Save
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1>Employee Availability</h1>
            <Table columns={columns} dataSource={data} pagination={false} />
        </div>
    );
};

export default Availibility;
