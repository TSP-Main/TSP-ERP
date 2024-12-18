import React, { useState, useEffect, useMemo } from "react";
import { Table, Row, Col, DatePicker, Select } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import {  absentEmployees} from "./attended/reducer";
import { allEmployee } from "../employee/redux/reducers";
import FilterComponent from "../components/FilterComponent";

const { RangePicker } = DatePicker;

const Reports = () => {
    const dispatch = useDispatch();
    const { absent } = useSelector((state) => state.scheduleEmployee);
    const { employeedata } = useSelector((state) => state.employee);

    const [employee, setEmployee] = useState(null); // Selected employee
    const [dateRange, setDateRange] = useState([moment(), moment()]); // Default date range
    const [role, setRole] = useState("employee"); // Default to "employee"
    const [filterText, setFilterText] = useState("");

    // Fetch attended schedule
    const fetchAttendedSchedule = (
        startDate,
        endDate,
        role = "employee",
        employeeId = null
    ) => {
        const code = localStorage.getItem("company_code");
        const payload = {
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: endDate.format("YYYY-MM-DD"),
            role, // Include role in the payload
            employee_id: employeeId, // Optional employee filter
        };
        dispatch(absentEmployees({ code, payload })).unwrap();
    };

    // Fetch employees list
    const fetchEmployees = () => {
        const code = localStorage.getItem("company_code");
        dispatch(allEmployee({ code }));
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchEmployees();
        fetchAttendedSchedule(dateRange[0], dateRange[1], role);
    }, []);

    // Handle Date Range Change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        if (dates && dates.length === 2) {
            fetchAttendedSchedule(dates[0], dates[1], role, employee);
        }
    };

    // Handle Role Change
    const handleRoleChange = (value) => {
        setRole(value);
        fetchAttendedSchedule(dateRange[0], dateRange[1], value, employee);
    };

    // Handle Filter Change
    const handleFilterChange = (value) => {
        setFilterText(value);
    };

    // Table Columns
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
        absent?.absent?.map((schedule, index) => ({
            key: index,
            name:
                role === "manager"
                    ? schedule?.manager?.user?.name || "N/A"
                    : schedule?.employee?.user?.name || "N/A", // Conditional logic based on role
            time_in: schedule.time_in || "-",
            time_out: schedule.time_out || "-",
            working_hours: schedule.working_hours || "-",
            Assigned_Schedule: `${
                schedule?.employee_schedule?.schedule?.start_time || "-"
            } - ${schedule?.employee_schedule?.schedule?.end_time || "-"}`,
        })) || [];

    // Filtered Items using memoization
    const filteredItems = useMemo(() => {
        return data.filter((item) =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(filterText.toLowerCase())
        );
    }, [data, filterText]);

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                placeholder={["Start Date", "End Date"]}
                            />
                        </Col>
                        <Col span={8}>
                            <Select
                                value={role}
                                style={{ width: "100%" }}
                                placeholder="Filter By Role"
                                onChange={handleRoleChange} // Trigger fetch on role change
                            >
                                <Select.Option value="employee">
                                    Employee
                                </Select.Option>
                                <Select.Option value="manager">
                                    Manager
                                </Select.Option>
                            </Select>
                        </Col>
                    </Row>
                </div>
                <FilterComponent
                    filterText={filterText}
                    onFilter={handleFilterChange}
                />
            </div>
            <Table
                style={{ marginTop: 16 }}
                columns={columns}
                dataSource={filteredItems}
                pagination={false}
            />
        </>
    );
};

export default Reports;
