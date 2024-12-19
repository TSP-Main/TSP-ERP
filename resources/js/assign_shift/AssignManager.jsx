import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Select, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { allEmployee } from "../employee/redux/reducers";
import { showSchedule, getAssignedSchedules } from "../shift/redux/reducer";
import { assignSchedule } from "../attendance/redux/reducer";
import { FaArrowRight } from "react-icons/fa";
import Loading from "../Loading";
import { gettActiveManagers } from "../manager/redux/reducer";
import Selection from "../components/Selection";
import AssignManager from "./AssignManager";

function RowHeaderTable() {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShiftsState, setSelectedShiftsState] = useState({});
    const [selectedValue, setSelectedValue] = useState("Employee");
    const dispatch = useDispatch();

    const { employeedata, loading: employeeLoading } = useSelector(
        (state) => state.employee
    );

    const { scheduledata, loading: scheduleLoading } = useSelector(
        (state) => state.schedule
    );
    const { assignedSchedules } = useSelector((state) => state.schedule);
    
    console.log("employee dsta,", employeedata);
    console.log("jnenfe", assignedSchedules);
    const getDatesForWeek = () => {
        const currentDate = new Date();
        const next7Days = [];

        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(currentDate);
            nextDay.setDate(currentDate.getDate() + i);
            next7Days.push({
                day: nextDay.toLocaleString("en-US", { weekday: "long" }),
                date: nextDay,
                formattedDate: nextDay.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
            });
        }

        return next7Days;
    };

    const reorderedDays = getDatesForWeek();

    const handleShiftChange = (employeeKey, column, shiftId) => {
        setSelectedShiftsState((prevShifts) => ({
            ...prevShifts,
            [employeeKey]: {
                ...prevShifts[employeeKey],
                [column]: shiftId,
            },
        }));
    };

    // Fetch employee data
    useEffect(() => {
        const code = localStorage.getItem("company_code");
        const role = localStorage.getItem("role");
        const id = localStorage.getItem("manager_id");

        if (role === "manager") {
            dispatch(allEmployee({ code, id }));
        } else {
            dispatch(allEmployee({ code }));
        }
    }, [dispatch]);

    // Fetch schedule data once (on component mount)
    useEffect(() => {
        const companyId = localStorage.getItem("company_id");
        if (companyId) {
            dispatch(showSchedule(companyId)); // Trigger the action to fetch schedule data
        }
    }, [dispatch]);

    // Format data for the table once employee data is available
    useEffect(() => {
        if (employeedata && employeedata.length > 0) {
            const formattedData = employeedata.map((employee) => ({
                key: employee.id,
                rowHeader: employee?.user?.name,
                ...reorderedDays.reduce((acc, day, index) => {
                    acc[`col${index + 1}`] = null;
                    return acc;
                }, {}),
            }));
            setDataSource(formattedData);
            setLoading(false);
        }
    }, [employeedata]);

    // Populate selectedShiftsState once assignedSchedules is fetched
    useEffect(() => {
        if (assignedSchedules && assignedSchedules.length > 0) {
            console.log("wnenmfenmrfmnrf");
            const shiftsState = {};
            console.log("Assigned", assignedSchedules);
            assignedSchedules.forEach((schedule) => {
                schedule.employees.forEach((employee) => {
                    const employeeId = employee.employee_id;
                    const shiftId = schedule.schedule_id;

                    // Parse start_date and end_date as Date objects
                    const startDate = new Date(employee.start_date);
                    const endDate = new Date(employee.end_date);

                    if (!shiftsState[employeeId]) {
                        shiftsState[employeeId] = {};
                    }

                    // Iterate through the range of dates
                    let currentDate = new Date(startDate); // Create a copy of the start date
                    while (currentDate <= endDate) {
                        // Find the index of the date in reorderedDays
                        const columnIndex = reorderedDays.findIndex(
                            (day) =>
                                day.date.toDateString() ===
                                currentDate.toDateString()
                        );

                        if (columnIndex !== -1) {
                            const columnKey = `col${columnIndex + 1}`;

                            // If columnKey doesn't exist, initialize as an array
                            if (!shiftsState[employeeId][columnKey]) {
                                shiftsState[employeeId][columnKey] = [];
                            }

                            // Add the shiftId to the column
                            if (
                                !shiftsState[employeeId][columnKey].includes(
                                    shiftId
                                )
                            ) {
                                shiftsState[employeeId][columnKey].push(
                                    shiftId
                                );
                            }
                        }

                        // Increment the current date by 1 day
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                });
            });

            setSelectedShiftsState(shiftsState);
        }
    }, [assignedSchedules]);

    console.log("shift state", selectedShiftsState);

    const handleSubmit = async () => {
        const payload = [];
        const employeeIds = Object.keys(selectedShiftsState);

        employeeIds.forEach((employeeId) => {
            const shifts = selectedShiftsState[employeeId];
            const groupedShifts = {};

            // Group shifts by schedule ID
            Object.entries(shifts).forEach(([column, scheduleId]) => {
                if (!groupedShifts[scheduleId]) {
                    groupedShifts[scheduleId] = [];
                }
                groupedShifts[scheduleId].push(column); // Collect column names (e.g., col1, col2)
            });

            // Create payload entries for each group
            Object.entries(groupedShifts).forEach(([scheduleId, columns]) => {
                if (scheduleId === null) return; // Skip if no shift is assigned

                const columnDates = columns.map(
                    (col) =>
                        reorderedDays[parseInt(col.replace("col", "")) - 1]
                            ?.date
                );

                // Sort dates and create start and end dates
                const sortedDates = columnDates.sort(
                    (a, b) => new Date(a) - new Date(b)
                );
                const startDate = sortedDates[0]?.toISOString().split("T")[0];
                const endDate = sortedDates[sortedDates.length - 1]
                    ?.toISOString()
                    .split("T")[0];

                payload.push({
                    employee_id: parseInt(employeeId),
                    schedule_id: parseInt(scheduleId),
                    start_date: startDate,
                    end_date: endDate,
                });
            });
        });
        try {
            const response = await dispatch(assignSchedule(payload));
            if (!response.error) {
                notification.success({
                    description: "Schedule assigned successfully",
                    duration: 3,
                });
            }
        } catch (error) {
            notification.error({
                description: error || "Problem assigning schedule. Try again.",
                duration: 3,
            });
        }

        console.log("Generated Payload:", payload);
    };

    const handleAssignShiftToAllDays = (employeeId, currentShifts) => {
        // Find the first non-null shift in currentShifts
        const firstNonNullShift = Object.keys(currentShifts).reduce(
            (acc, key) => {
                if (currentShifts[key] !== null && !acc) {
                    return currentShifts[key]; // Return the first valid shift ID
                }
                return acc;
            },
            null
        ); // Default to null if no non-null value found

        // If a non-null shift exists, apply it to all columns for the given employee
        if (firstNonNullShift !== null) {
            setSelectedShiftsState((prevState) => ({
                ...prevState,
                [employeeId]: {
                    // Apply the first non-null shift to all columns
                    ...reorderedDays.reduce((acc, _, index) => {
                        acc[`col${index + 1}`] = firstNonNullShift; // Apply to col1, col2, etc.
                        return acc;
                    }, {}),
                },
            }));
        }
    };

    const columns = [
        {
            title: "Employee",
            dataIndex: "rowHeader",
            key: "key",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.rowHeader?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.rowHeader?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
            fixed: "left",
            width: 150,
            render: (text, record) => (
                <span
                    style={{
                        display: "flex",
                        flexGrow: 1,
                        justifyContent: "space-between",
                    }}
                >
                    {text}
                    <div>
                        <FaArrowRight
                            type="link"
                            onClick={() =>
                                handleAssignShiftToAllDays(
                                    record.key,
                                    selectedShiftsState[record.key] || {}
                                )
                            }
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                </span>
            ),
        },
        ...reorderedDays.map((day, dayIndex) => ({
            title: (
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold" }}>{day.day}</div>
                    <div>{day.formattedDate}</div>
                </div>
            ),
            fixed: "top",
            dataIndex: `col${dayIndex + 1}`,
            key: `${day.day}-${dayIndex}`,
            // width: 200,
            render: (text, record) => {
                // Get the shift ID from selectedShiftsState for this employee (record.key) and column (colN)
                const shiftId =
                    selectedShiftsState[record.key]?.[`col${dayIndex + 1}`];
                return (
                    <Select
                        style={{
                            width: "100%",
                            // Default compact width
                        }}
                        dropdownStyle={{
                            width: "auto", // Allow dropdown to expand
                            minWidth: "150px", // Set minimum width for the dropdown
                        }}
                        placeholder="Select shift"
                        // style={{ width: "100%" }}
                        value={shiftId}
                        onChange={(value) =>
                            handleShiftChange(
                                record.key,
                                `col${dayIndex + 1}`,
                                value
                            )
                        }
                    >
                        <Select.Option value={null} style={{ color: "gray" }}>
                            No Schedule
                        </Select.Option>
                        {scheduledata.map((data) => (
                            <Select.Option
                                key={data.schedule_id}
                                value={data.schedule_id}
                            >
                                {`${data.start_time}-${data.end_time}`}
                            </Select.Option>
                        ))}
                    </Select>
                );
            },
        })),
    ];

    useEffect(() => {
        const companyId = localStorage.getItem("company_id");
        const role = "employee";
        if (companyId) {
            dispatch(getAssignedSchedules({ companyId, role }));
        }
    }, [dispatch]);

    // if (scheduleLoading || loading) {
    //     return <Spin />;
    // }

    if (scheduleLoading) {
        return <Loading />;
    }

    console.log("data source: ", dataSource);
    console.log("employee data: ", employeedata);
    // console.log("schedule data: ", scheduledata);
    // console.log("assigned schedules: ", assignedSchedules);
    // console.log("shift state: ", selectedShiftsState);

    const handleSelectedValue = (value) => {
        setSelectedValue(value);
        setLoading(true); // Set loading while fetching data
    };

    return (
        <>
            <h1>Assign Shift</h1>
            <Selection onSelect={handleSelectedValue} />
            {selectedValue === "Employee" && (
                <Table
                    key={JSON.stringify(dataSource)}
                    size="small"
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    bordered
                    scroll={{ x: "max-content", y: 500 }}
                    rowKey="key"
                />
            )}
            {selectedValue === "Manager" && <AssignManager />}

            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 16,
                }}
            >
                <Button
                    type="primary"
                    style={{ backgroundColor: "black" }}
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </div>
        </>
    );
}

export default RowHeaderTable;