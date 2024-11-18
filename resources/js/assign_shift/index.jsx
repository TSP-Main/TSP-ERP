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
    const [dataSource, setDataSource] = useState([]);
    const [loading,setLoading] = useState(false)


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
            return [...upcomingDays, ...nextWeekDays];
        }

        // If today is Sunday, return only upcomingDays
        return upcomingDays;
    };
        return upcomingDays;
    };

    const reorderedDays = getDatesForWeek();
    // const reorderedDays = getDatesForWeek();

    // Helper function to create the payload for assigning shifts
    // Helper function to create the payload for assigning shifts
   const createPayload = () => {
       const payload = [];

       shiftAssignments.forEach((assignment) => {
           // Sort the days to make sure the dates are in order
           const sortedDays = assignment.days.sort((a, b) => a.date - b.date);

           // Find the earliest and latest dates for this assignment
           const startDate = sortedDays[0].date.toISOString().slice(0, 10);
           const endDate = sortedDays[sortedDays.length - 1].date
               .toISOString()
               .slice(0, 10);

           payload.push({
               employee_id: assignment.employeeId,
               schedule_id: assignment.scheduleId,
               start_date: startDate,
               end_date: endDate,
           });
       });

       console.log("Payload: ", payload);
       return payload;
   };

   const handleCellClick = (employeeId, dayIndex, shiftId) => {
       setShiftAssignments((prevAssignments) => {
           const updatedAssignments = [...prevAssignments];

           // Find an existing assignment for the employee
           const employeeAssignment = updatedAssignments.find(
               (assignment) => assignment.employeeId === employeeId
           );

           if (employeeAssignment) {
               // If the employee already has an assignment
               const dayExists = employeeAssignment.days.findIndex(
                   (day) =>
                       day.date.toISOString().slice(0, 10) ===
                       reorderedDays[dayIndex].date.toISOString().slice(0, 10)
               );

               if (dayExists !== -1) {
                   // Update the shiftId if the day already exists
                   employeeAssignment.days[dayExists].shiftId = shiftId;
               } else {
                   // Add a new day if it doesn't exist
                   employeeAssignment.days.push({
                       date: reorderedDays[dayIndex].date,
                       shiftId,
                   });
               }
           } else {
               // Create a new assignment if none exists for the employee
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
    const shiftId = selectedShifts[employeeId];
    if (shiftId) {
        // Assign shifts for the whole week for the employee
        reorderedDays.forEach((_, dayIndex) => {
            handleCellClick(employeeId, dayIndex, shiftId);
        });

        // Update the data source immutably for the table display
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
            key: `${day.day}-${index}`, // Unique key for each column
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

    // if (scheduleLoading || loading) {
    //     return <Spin />;
    // }

    console.log("schecdule data: ", scheduledata);
    console.log("employee data: ", employeedata);
    console.log("data source: ", dataSource);
    console.log("selected shifts: ", selectedShifts);
    // Show loading spinner until all data is loaded
    if (loading || scheduleLoading) {
        return <Spin />;
    }

    return (
        <>
            <Table
                // key={JSON.stringify(dataSource)} // This forces a rerender when dataSource changes
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
}

export default RowHeaderTable;
