import React, { useState, useEffect } from "react";
import { Table, Row, Col, DatePicker, Button } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { presentEmployees } from "./attended/reducer";

const Reports = () => {
    const dispatch = useDispatch();
    const { present } = useSelector((state) => state.scheduleEmployee);
    console.log("present",present.present)
    // Default to today's date
    const [selectedDate, setSelectedDate] = useState(moment());

    // Fetch attended schedule for a specific date
    const fetchAttendedSchedule = (date) => {
        const code = localStorage.getItem("company_code");
        const payload = {
            start_date: date.format("YYYY-MM-DD"),
            end_date: date.format("YYYY-MM-DD"),
        };
        console.log("Payload:", payload);
        dispatch(presentEmployees({ code, payload })).unwrap();
    };

    useEffect(() => {
        fetchAttendedSchedule(moment()); // Fetch data for today by default
    }, []);

    // Columns for the table
    const columns = [
        {
            title: "Name",
            key: "name",
            render: (record) => record.name || "-",
        },
        {
            title: "Check-In Time",
            dataIndex: "time_in",
            key: "check-in",
        },
        {
            title: "Check-Out Time",
            dataIndex: "time_out",
            key: "check-out",
        },
        {
            title: "Total Working Hours",
            dataIndex: "working_hours",
            key: "working-hours",
        },
    ];

    // Prepare data for the table
    const data =
        present?.present?.map((schedule, index) => ({
        key: index,
           name: schedule?.employee?.user?.name,
            time_in: schedule.time_in || "-",
            time_out: schedule.time_out || "-",
            working_hours: schedule.working_hours || "-",
        })) || [];

    // Disable dates from tomorrow onwa
    // Handle date change
    const handleDateChange = (date) => {
        setSelectedDate(date);
        fetchAttendedSchedule(date);
    };

    return (
        <>
            <div>
                <Row gutter={12}>
                    <Col span={5}>
                        <DatePicker
                            picker="day"
                            value={selectedDate}
                            onChange={handleDateChange}
                            placeholder="Select Date"
                        />
                    </Col>
                    <Col span={2}>
                        <Button
                            type="primary"
                            onClick={() => fetchAttendedSchedule(selectedDate)}
                        >
                            Submit
                        </Button>
                    </Col>
                </Row>
            </div>
            <Table
                style={{ marginTop: 16 }}
                columns={columns}
                dataSource={data}
                pagination={false} // Show all data without pagination
            />
        </>
    );
};

export default Reports;
