import React, { useState, useEffect } from "react";
import { Table, Row, Col, DatePicker, Button } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { missedSchedule } from "../attended/reducer";

// Function to get today's date and the previous 6 dates
const getDatesRange = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = moment().subtract(i, "days").format("YYYY-MM-DD");
        dates.push({
            key: i,
            date: date,
            daysFromToday: i === 0 ? "Today" : `${i > 0 ? "+" : ""}${i} days`,
        });
    }
    return dates;
};


const Missed = () => {
    const dispatch = useDispatch();
    const { missed } = useSelector((state) => state.scheduleEmployee);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Function to fetch attended schedules
    const fetchMissedSchedule = () => {
        const startDate = moment().subtract(6, "days"); // 6 days before today
        const endDate = moment(); // Today's date
        const id = localStorage.getItem("employee_id");
        const payload = {
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: endDate.format("YYYY-MM-DD"),
        };
        dispatch(missedSchedule({ id, payload }));
    };

    useEffect(() => {
        fetchMissedSchedule();
    }, []);

    // Column configuration for the antd table
    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "CheckIn Time",
            dataIndex: "time_in",
            key: "check-in",
        },
        {
            title: "CheckOut Time",
            dataIndex: "time_out",
            key: "check-out",
        },
        {
            title: "Total Working Hours",
            dataIndex: "working_hours",
            key: "working-hours",
        },
    ];

    // Map data for the table
    const data = getDatesRange()
        .map((dateObj) => {
            // Find all schedules for the given date
            const matchedSchedules = missed?.missed_schedules?.filter(
                (schedule) => schedule.date === dateObj.date
            );

            // If there are no records, return empty fields
            if (!matchedSchedules || matchedSchedules.length === 0) {
                return {
                    ...dateObj,
                    time_in: "",
                    time_out: "",
                    working_hours: "",
                };
            }

            // If there are records, map them into separate rows
            return matchedSchedules.map((schedule, index) => ({
                key: `${dateObj.date}-${index}`, // Ensure unique key for each row
                date: dateObj.date,
                time_in: schedule.time_in,
                time_out: schedule.time_out,
                working_hours: schedule.working_hours,
            }));
        })
        .flat(); // Flatten the array if there are multiple records for a date

    // Disable dates from tomorrow onwards
    const disabledDate = (current) => {
        return current && current > moment().endOf("day");
    };

    // Handle start date change
    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date && endDate && date.isAfter(endDate)) {
            setEndDate(null);
        }
    };

    // Handle end date change
    const handleEndDateChange = (date) => {
        setEndDate(date);
    };

    // Submit the filter (optional)
    const handleSubmit = () => {
        console.log("Start Date: ", startDate?.format("YYYY-MM-DD"));
        console.log("End Date: ", endDate?.format("YYYY-MM-DD"));
    };

    return (
        <>
            <div>
                <Row gutter={12}>
                    <Col span={5}>
                        <DatePicker
                            value={startDate}
                            onChange={handleStartDateChange}
                            disabledDate={disabledDate}
                            placeholder="Select Start Date"
                            style={{ width: "100%" }}
                        />
                    </Col>
                    <Col span={5}>
                        <DatePicker
                            value={endDate}
                            onChange={handleEndDateChange}
                            disabledDate={disabledDate}
                            placeholder="Select End Date"
                            style={{ width: "100%" }}
                            disabled={!startDate} // Disable end date if start date is not selected
                        />
                    </Col>
                    <Col span={2}>
                        <Button type="primary" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Col>
                </Row>
            </div>
            <Table
                style={{ marginTop: 16 }}
                columns={columns}
                dataSource={data}
                pagination={false} // Disable pagination to show all dates
            />
        </>
    );
};

export default Missed;
