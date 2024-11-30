import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Select,Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { allEmployee } from "../employee/redux/reducers";
import ShiftDropdown from "./components/ShiftDropdown";
import { showSchedule, getAssignedSchedules } from "../shift/redux/reducer";
import { assignSchedule } from "../attendance/redux/reducer";
import { FaArrowRight } from "react-icons/fa";

function RowHeaderTable() {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedShiftsState, setSelectedShiftsState] = useState({});

    const dispatch = useDispatch();

    const { employeedata, loading: employeeLoading } = useSelector(
        (state) => state.employee
    );
    const { scheduledata, loading: scheduleLoading } = useSelector(
        (state) => state.schedule
    );
    console.log("schedule data", scheduledata)
    console.log("Employess",employeedata);
    const { assignedSchedules } = useSelector((state) => state.schedule);

    const getDatesForWeek = () => {
        const currentDate = new Date();
        const next7Days = [];

        for (let i = 1; i <= 7; i++) {
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
        const payload = {
            role: "employee",
            code: code,
        };
        dispatch(allEmployee(payload));
    }, [dispatch]);

    // Fetch schedule data once (on component mount)
    useEffect(() => {
        const companyId = localStorage.getItem("company_id");
        if (companyId) {
            dispatch(showSchedule(companyId)); // Trigger the action to fetch schedule data
        }
    }, [dispatch]);

  useEffect(() => {
      if (!loading && !employeedata?.length) {
          console.log("No employees found or error occurred.");
          setLoading(false); // Ensure loading ends even if data is empty
      } else if (employeedata?.length > 0) {
          const formattedData = employeedata.map((employee) => ({
              key: employee.id,
              rowHeader: employee.name,
              ...reorderedDays.reduce((acc, day, index) => {
                  acc[`col${index + 1}`] = null;
                  return acc;
              }, {}),
          }));
          setDataSource(formattedData);
          setLoading(false);
      }
  }, [employeedata, loading, reorderedDays]);
    // Populate selectedShiftsState once assignedSchedules is fetched
    useEffect(() => {
        if (assignedSchedules && assignedSchedules.length > 0) {
            const shiftsState = {};

            // Iterate through each schedule and map employees to shifts
            assignedSchedules.forEach((schedule) => {
                // Iterate through the employees assigned to the current schedule
                schedule.employees.forEach((employee) => {
                    const employeeId = employee.employee_id;
                    const shiftId = schedule.schedule_id;

                    // Check if the employee already has an entry in shiftsState
                    if (!shiftsState[employeeId]) {
                        shiftsState[employeeId] = {}; // Initialize if not present
                    }

                    // For each employee, assign the shift to the appropriate column (col1, col2, ...)
                    const shiftColumn = schedule.schedule_id; // Using the schedule_id as the column number

                    // Map the schedule_id (shift) to the column for the specific employee
                    shiftsState[employeeId][`col${shiftColumn}`] = shiftId;
                });
            });

            // Update the selectedShiftsState with the mapped shifts
            setSelectedShiftsState(shiftsState);
        }
    }, [assignedSchedules]);

    const handleSubmit = () => {
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

        dispatch(assignSchedule(payload));

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
            width: 200,
            render: (text, record) => {
                // Get the shift ID from selectedShiftsState for this employee (record.key) and column (colN)
                const shiftId =
                    selectedShiftsState[record.key]?.[`col${dayIndex + 1}`];
                return (
                    <Select
                        placeholder="Select shift"
                        style={{ width: "100%" }}
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
        if (companyId) {
            dispatch(getAssignedSchedules(companyId));
        }
    }, [dispatch]);

    // if (scheduleLoading || loading) {
    //     return <Spin />;
    // }

    if (loading) {
        console.log("Loading is true; waiting for data...");
        return <Spin size="large" tip="Loading..." />;
    }

    // Error or Empty Employee Data
    // if (error) {
    //     console.error("Error:", error);
    //     return <Alert message="Error" description={error} type="error" />;
    // }

    if (!employeedata || employeedata.length === 0) {
        console.log("Employee data is empty.");
        return (
            <Alert
                message="No Employees Found"
                description="There are no employees available to display. Please add employees and try again."
                type="info"
                showIcon
            />
        );
    }
        return (
    <>
        <Table
            key={JSON.stringify(dataSource)}
            size="middle"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered
            scroll={{ x: "max-content", y: 500 }}
            rowKey="key"
            style={{
                minWidth: 800,
                tableLayout: "fixed",
                overflowX: "auto",
                overflowY: "auto",
            }}
            locale={{
                emptyText: "No employees or shifts available.",
            }}
        />

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
