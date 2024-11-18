import React, { useEffect, useState } from "react";
import { Table, Spin, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { allEmployee } from "../employee/redux/reducers";
import ShiftDropdown from "./components/ShiftDropdown";
import { showSchedule } from "../shift/redux/reducer";
import { FaArrowRight } from "react-icons/fa";

function RowHeaderTable() {
    const [shiftAssignments, setShiftAssignments] = useState([]);
    const [selectedShifts, setSelectedShifts] = useState({});
    const dispatch = useDispatch();
    const { employeedata } = useSelector((state) => state.employee);
    const { scheduledata, loading: scheduleLoading } = useSelector(
        (state) => state.schedule
    );
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);

    const todayIndex = new Date().getDay();
    const currentDate = new Date();
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    // Helper function to filter only upcoming dates
    const getDatesForWeek = () => {
        const todayIndex = currentDate.getDay(); // Get today's index (0=Sunday, 1=Monday, ..., 6=Saturday)

        // Collect days from today to Saturday (end of the week)
        const upcomingDays = daysOfWeek.slice(todayIndex).map((dayName, i) => {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + i); // Increment day starting from today
            return {
                day: dayName,
                date: date,
                formattedDate: date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
            };
        });

        // If today is not Sunday, include the start of the next week
        if (todayIndex > 0) {
            const nextWeekDays = daysOfWeek
                .slice(0, todayIndex)
                .map((dayName, i) => {
                    const date = new Date(currentDate);
                    date.setDate(
                        currentDate.getDate() + upcomingDays.length + i
                    ); // Increment to wrap around to next week
                    return {
                        day: dayName,
                        date: date,
                        formattedDate: date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        }),
                    };
                });

            return [...upcomingDays, ...nextWeekDays];
        }

        // If today is Sunday, return only upcomingDays
        return upcomingDays;
    };

    const reorderedDays = getDatesForWeek();

    // Helper function to create the payload for assigning shifts
    // Helper function to create the payload for assigning shifts
    const createPayload = () => {
        const payload = [];

        shiftAssignments.forEach((assignment) => {
            if (assignment.days.length === 1) {
                payload.push({
                    employee_id: assignment.employeeId,
                    schedule_id: assignment.scheduleId,
                    start_date: assignment.days[0].date
                        .toISOString()
                        .slice(0, 10), // Format date as YYYY-MM-DD
                    end_date: assignment.days[0].date
                        .toISOString()
                        .slice(0, 10), // Format date as YYYY-MM-DD
                });
            } else {
                const startDate = assignment.days[0].date
                    .toISOString()
                    .slice(0, 10); // Format date as YYYY-MM-DD
                const endDate = assignment.days[assignment.days.length - 1].date
                    .toISOString()
                    .slice(0, 10); // Format date as YYYY-MM-DD

                payload.push({
                    employee_id: assignment.employeeId,
                    schedule_id: assignment.scheduleId,
                    start_date: startDate,
                    end_date: endDate,
                });
            }
        });
        console.log("payload: " + payload);
        return payload;
    };

    const handleCellClick = (employeeId, dayIndex, shiftId) => {
        setShiftAssignments((prevAssignments) => {
            const updatedAssignments = prevAssignments.map((assignment) => {
                if (assignment.employeeId === employeeId) {
                    const dayExists = assignment.days.findIndex(
                        (day) => day.date === reorderedDays[dayIndex].date
                    );

                    if (dayExists !== -1) {
                        assignment.days[dayExists].shiftId = shiftId;
                    } else {
                        console.log("Assignment1");
                        assignment.days.push({
                            date: reorderedDays[dayIndex].date,
                            shiftId,
                        });
                    }
                    return assignment;
                }
                return assignment;
            });

            if (
                !updatedAssignments.some(
                    (assignment) => assignment.employeeId === employeeId
                )
            ) {
                console.log("Assignment");
                updatedAssignments.push({
                    employeeId,
                    scheduleId: shiftId,
                    days: [{ date: reorderedDays[dayIndex].date, shiftId }],
                });
            }

            return updatedAssignments;
        });
    };

    // Fetch employee data
    useEffect(() => {
        console.log("query");
        dispatch(allEmployee(localStorage.getItem("company_code")));
    }, []);

    // Fetch schedule data once (on component mount)
    useEffect(() => {
        console.log("query");
        const companyId = localStorage.getItem("company_id");
        if (companyId) {
            dispatch(showSchedule(companyId)); // Trigger the action to fetch schedule data
        }
    }, []);

    // Format data for the table once employee data is available
    useEffect(() => {
        if (employeedata && employeedata.length > 0) {
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
    }, [employeedata]);

    // Handle shift assignment for all days when arrow icon is clicked
    // Handle shift assignment for all days when arrow icon is clicked
    const assignShiftForAllDays = (employeeId) => {
        console.log("employee id", employeeId);
        onShiftSelect = employeeId;
        const shiftId = selectedShifts[employeeId];
        console.log("shift ", shiftId);
        if (shiftId) {
            // Loop through each day in the week and call handleCellClick for each day
            reorderedDays.forEach((_, dayIndex) => {
                handleCellClick(employeeId, dayIndex, shiftId);
            });

            // Update the data source for the table immutably
            setDataSource((prevDataSource) =>
                prevDataSource.map((item) => {
                    if (item.key === employeeId) {
                        return {
                            ...item,
                            ...reorderedDays.reduce((acc, day, index) => {
                                acc[`col${index + 1}`] = shiftId; // Apply shift ID to all columns
                                return acc;
                            }, {}),
                        };
                    }
                    console.log("handle ", dataSource);
                    return item;
                })
            );
        }
    };

    const handleSubmit = () => {
        const payload = createPayload();
        console.log("payload", payload);
        // Send the payload to the API here if needed
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
                            onClick={() => assignShiftForAllDays(record.key)}
                        />
                    </div>
                </span>
            ),
        },
        ...reorderedDays.map((day, index) => ({
            title: (
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold" }}>{day.day}</div>
                    <div>{day.formattedDate}</div>
                </div>
            ),
            fixed: "top",
            dataIndex: `col${index + 1}`,
            key: `${day.day}-${index}`, // Unique key for each column
            width: 200,
            render: (text, record) => (
                <ShiftDropdown
                    scheduledata={scheduledata}
                    onShiftSelect={(shiftId) => {
                        // handleCellClick(record.key, index, shiftId);
                        setSelectedShifts((prev) => ({
                            ...prev,
                            [record.key]: shiftId,
                            startDate: record.startDate,
                            endDate: record.endDate,
                        }));
                    }}
                    selectedShiftId={selectedShifts[record.key]}
                />
            ),
            onCell: (record) => ({
                style: {
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                },
            }),
        })),
    ];

    // if (scheduleLoading || loading) {
    //     return <Spin />;
    // }

    console.log("schecdule data: ", scheduledata);
    console.log("employee data: ", employeedata);
    console.log("data source: ", dataSource);
    console.log("selected shifts: ", selectedShifts);

    return (
        <>
            <Table
                key={JSON.stringify(dataSource)} // This forces a rerender when dataSource changes
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
