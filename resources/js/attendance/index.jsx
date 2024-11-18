import { Table, Button } from "antd";
import React, { useState, useEffect } from "react";
import moment from "moment"; // Ensure you have moment.js installed

const Index = () => {
    // Generate dates starting from yesterday towards the next 7 days
    const generateDates = () => {
        const dates = [];
        const yesterday = moment().subtract(1, "days"); // Start from yesterday

        for (let i = 0; i < 7; i++) {
            const date = moment(yesterday).add(i, "days"); // Increment days from yesterday
            dates.push({
                key: i.toString(),
                date: date.format("dddd, MMM DD"), // Format as Day, Month Day (e.g., "Monday, Nov 14")
                start_time: "09:00 AM",
                end_time: "05:00 PM",
            });
        }
        return dates;
    };

    const [data, setData] = useState([]);

    useEffect(() => {
        // Generate dates for the next 7 days including yesterday
        const futureDates = generateDates();
        setData(futureDates);
    }, []);

    const columns = [
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
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <>
                    <Button
                        style={{ marginRight: "10px" }}
                        type="primary"
                        onClick={() => console.log("Check In")}
                    >
                        Check In
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => console.log("Check Out")}
                    >
                        Check Out
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            pagination={false} // Remove pagination to show all dates in one view
        />
    );
};

export default Index;
