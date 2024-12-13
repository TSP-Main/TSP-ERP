import React, { useState, useEffect,useMemo } from "react";
import { Table, Row, Col, DatePicker, Select } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { presentEmployees } from "./attended/reducer";
import { allEmployee } from "../employee/redux/reducers";
import FilterComponent from "../components/FilterComponent";
const { RangePicker } = DatePicker;

const Reports = () => {
    const dispatch = useDispatch();
    const { present } = useSelector((state) => state.scheduleEmployee);
    const { employeedata } = useSelector((state) => state.employee);
    const [employee, setEmployee] = useState(null); // State to store selected employee ID
    const [dateRange, setDateRange] = useState([moment(), moment()]); // Default to today's date range
      const [filterText, setFilterText] = useState("");

      // Handle filter changes
      const handleFilterChange = (value) => {
          setFilterText(value);
      };

      // Clear the filter text
    //   const handleClearFilter = () => {
    //       setFilterText("");
    //   };

      // Memoized filtered items
     
    // Fetch attended schedule for a specific date range and employee
    const fetchAttendedSchedule = (startDate, endDate, employeeId = null) => {
        const code = localStorage.getItem("company_code");
        const payload = {
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: endDate.format("YYYY-MM-DD"),
            employee_id: employeeId, // Include employee ID in the payload
        };
        dispatch(presentEmployees({ code, payload })).unwrap();
    };

    const fetchEmployees = () => {
        const code = localStorage.getItem("company_code");
        dispatch(allEmployee({ code }));
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Default fetch for today's date range
    useEffect(() => {
        fetchAttendedSchedule(dateRange[0], dateRange[1]);
    }, []);

    // Handle RangePicker Change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        if (dates && dates.length === 2) {
            fetchAttendedSchedule(dates[0], dates[1], employee); // Fetch on date range change
        }
    };

    // Handle Employee Selection
    const handleEmployeeChange = (value) => {
        setEmployee(value);
        fetchAttendedSchedule(dateRange[0], dateRange[1], value); // Fetch on employee selection
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
                                onChange={handleDateRangeChange} // Trigger fetch on range change
                                placeholder={["Start Date", "End Date"]}
                            />
                        </Col>
                        <Col span={8}>
                            <Select
                                style={{ width: "100%" }}
                                placeholder="Select Employee"
                                onChange={handleEmployeeChange} // Trigger fetch on employee selection
                            >
                                {employeedata?.map((data) => (
                                    <Select.Option
                                        key={data.id}
                                        value={data.id}
                                    >
                                        {data.user.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        
                    </Row>
                </div>
                {/* <div> */}
                    <FilterComponent
                        filterText={filterText}
                        onFilter={handleFilterChange}
                    />
                {/* </div> */}
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
