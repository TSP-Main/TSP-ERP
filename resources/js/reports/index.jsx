import React, { useState, useEffect } from "react";
import { Table, Row, Col, DatePicker, Button } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { presentEmployees } from "./attended/reducer";

const Reports = () => {
    const dispatch = useDispatch();
    const { present } = useSelector((state) => state.scheduleEmployee);

    const [selectStartDate, setStartData] = useState(moment());
    const [selectEndDate, setEndDate] = useState(moment());

    // Fetch attended schedule for a specific date range
    const fetchAttendedSchedule = (startDate, endDate) => {
        const code = localStorage.getItem("company_code");
        const payload = {
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: endDate.format("YYYY-MM-DD"),
        };
        dispatch(presentEmployees({ code, payload })).unwrap();
    };

    // Default fetch for today's date
    useEffect(() => {
        fetchAttendedSchedule(moment(), moment());
    }, []);

    // Handle Start Date Change
    const handleStartDateChange = (date) => {
        setStartData(date);
    };

    // Handle End Date Change
    const handleEndDateChange = (date) => {
        setEndDate(date);
    };

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
        {
            title: "Assigned Schedule",
            key: "Assigned_Schedule",
            render: (record) => record.Assigned_Schedule || "-",
        },
    ];

    // Prepare data for the table
    const data =
        present?.present?.map((schedule, index) => ({
            key: index,
            name: schedule?.employee?.user?.name || "N/A",
            time_in: schedule.time_in || "-",
            time_out: schedule.time_out || "-",
            working_hours: schedule.working_hours || "-",
            Assigned_Schedule: `${
                schedule?.employee_schedule?.schedule?.start_time || "-"
            } - ${schedule?.employee_schedule?.schedule?.end_time || "-"}`,
        })) || [];

    return (
        <>
            <div>
                <Row gutter={12}>
                    <Col span={5}>
                        <DatePicker
                            picker="day"
                            value={selectStartDate}
                            onChange={handleStartDateChange}
                            placeholder="Select Start Date"
                        />
                    </Col>
                    <Col span={5}>
                        <DatePicker
                            picker="day"
                            value={selectEndDate}
                            onChange={handleEndDateChange}
                            placeholder="Select End Date"
                        />
                    </Col>
                    <Col span={2}>
                        <Button
                            type="primary"
                            onClick={() =>
                                fetchAttendedSchedule(
                                    selectStartDate,
                                    selectEndDate
                                )
                            }
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
                pagination={false}
            />
        </>
    );
};

export default Reports;
