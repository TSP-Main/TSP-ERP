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
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true); // Unified loading state

    const dispatch = useDispatch();
    const { employeedata, loading: employeeLoading } = useSelector(
        (state) => state.employee
    );
    const { scheduledata, loading: scheduleLoading } = useSelector(
        (state) => state.schedule
    );

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
        const upcomingDays = daysOfWeek.slice(todayIndex).map((dayName, i) => {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + i);
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
                    );
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

        return upcomingDays;
    };

    const reorderedDays = getDatesForWeek();

    // Fetch employee data
    useEffect(() => {
        dispatch(allEmployee(sessionStorage.getItem("company_code")));
    }, [dispatch]);

    // Fetch schedule data once (on component mount)
    useEffect(() => {
        const companyId = sessionStorage.getItem("company_id");
        if (companyId) {
            dispatch(showSchedule(companyId)); // Trigger the action to fetch schedule data
        }
    }, [dispatch]);

    // Format data for the table once employee data is available
    useEffect(() => {
        // Wait until both `employeedata` and `scheduledata` are fully loaded
        if (
            !employeeLoading &&
            !scheduleLoading &&
            employeedata &&
            employeedata.length > 0
        ) {
            const formattedData = employeedata.map((employee) => ({
                key: employee.id,
                rowHeader: employee.name,
                ...reorderedDays.reduce((acc, day, index) => {
                    acc[`col${index + 1}`] = null;
                    return acc;
                }, {}),
            }));
            setDataSource(formattedData);
            setLoading(false); // Stop loading once data is processed
        }
    }, [employeeLoading, scheduleLoading, employeedata]);

    const createPayload = () => {
        const payload = [];

        shiftAssignments.forEach((assignment) => {
            if (assignment.days.length === 1) {
                payload.push({
                    employee_id: assignment.employeeId,
                    schedule_id: assignment.scheduleId,
                    start_date: assignment.days[0].date
                        .toISOString()
                        .slice(0, 10),
                    end_date: assignment.days[0].date
                        .toISOString()
                        .slice(0, 10),
                });
            } else {
                const startDate = assignment.days[0].date
                    .toISOString()
                    .slice(0, 10);
                const endDate = assignment.days[assignment.days.length - 1].date
                    .toISOString()
                    .slice(0, 10);

                payload.push({
                    employee_id: assignment.employeeId,
                    schedule_id: assignment.scheduleId,
                    start_date: startDate,
                    end_date: endDate,
                });
            }
        });

        console.log("payload: ", payload);
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
                updatedAssignments.push({
                    employeeId,
                    scheduleId: shiftId,
                    days: [{ date: reorderedDays[dayIndex].date, shiftId }],
                });
            }

            return updatedAssignments;
        });
    };

    const assignShiftForAllDays = (employeeId, shiftId) => {
        if (shiftId) {
            // Update the shift assignments immutably
            setShiftAssignments((prevAssignments) => {
                const updatedAssignments = prevAssignments.map((assignment) => {
                    if (assignment.employeeId === employeeId) {
                        return {
                            ...assignment,
                            days: reorderedDays.map((day) => ({
                                date: day.date,
                                shiftId,
                            })),
                        };
                    }
                    return assignment;
                });

                if (
                    !updatedAssignments.some(
                        (assignment) => assignment.employeeId === employeeId
                    )
                ) {
                    return [
                        ...updatedAssignments,
                        {
                            employeeId,
                            scheduleId: shiftId,
                            days: reorderedDays.map((day) => ({
                                date: day.date,
                                shiftId,
                            })),
                        },
                    ];
                }

                return updatedAssignments;
            });

            // Update the data source for the table immutably
            setDataSource((prevDataSource) =>
                prevDataSource.map((item) => {
                    if (item.key === employeeId) {
                        return {
                            ...item,
                            ...reorderedDays.reduce((acc, day, index) => {
                                acc[`col${index + 1}`] = shiftId;
                                return acc;
                            }, {}),
                        };
                    }
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
                            onClick={() => {
                                const shiftId = selectedShifts[record.key];
                                if (shiftId) {
                                    assignShiftForAllDays(record.key, shiftId);
                                }
                            }}
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
            key: `${day.day}-${index}`,
            width: 200,
            render: (text, record) => (
                <ShiftDropdown
                    scheduledata={scheduledata}
                    onShiftSelect={(shiftId) => {
                        handleCellClick(record.key, index, shiftId);
                        setSelectedShifts((prev) => ({
                            ...prev,
                            [record.key]: shiftId,
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

    // Show loading spinner until all data is loaded
    if (loading || scheduleLoading) {
        return <Spin />;
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
