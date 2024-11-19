import { Table, Button } from "antd";
import React, { useState, useEffect } from "react";
import moment from "moment"; // Ensure you have moment.js installed
import { useDispatch, useSelector } from "react-redux";
import { assignedShechule, checkIn, checkOut } from "./redux/reducer";

const Index = () => {
    const dispatch = useDispatch();
    const { dataa, loading, error } = useSelector(
        (state) => state.assignedShechule
    ); // Assuming your Redux state is correct
    const [data, setData] = useState([]);
    const [statusCheckIn, setStatusCheckIn] = useState(false);
    // Generate dates starting from yesterday towards the next 7 days
    const generateDates = () => {
        const dates = [];
        const yesterday = moment().subtract(1, "days"); // Start from yesterday

        for (let i = 0; i < 7; i++) {
            const date = moment(yesterday).add(i, "days"); // Increment days from yesterday
            dates.push({
                key: i.toString(),
                date: date.format("YYYY-MM-DD"), // Use YYYY-MM-DD format for easier comparison
                displayDate: date.format("dddd, MMM DD"), // Format for display
                schedules: [], // Initially set as empty array to hold schedules
            });
        }
        return dates;
    };
    function getCurrentTime() {
        const now = new Date();

        // Pad hours, minutes, and seconds to always have two digits
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        // Return the formatted time
        return `${hours}:${minutes}:${seconds}`;
    }
    const handleCheckIn = async () => {
        const id = localStorage.getItem("employee_id");
        const time_in = getCurrentTime();

        // Construct the payload object
        const payload = {
            id,
            time_in,
        };

        console.log("Attempting to Check In", payload);

        try {
            // Dispatch the action and wait for its completion if it's a thunk
            await dispatch(checkIn(payload));

            // Update state and localStorage upon success
            setStatusCheckIn(true);
            localStorage.setItem("statusCheckIn", "true");

            console.log("Successfully Checked In:", payload);
        } catch (error) {
            console.error("Error during Check In:", error);
        }
    };

  const handleCheckOut = async () => {
      const id = localStorage.getItem("employee_id");
      const time_out = getCurrentTime();

      // Construct the payload object
      const payload = {
          id,
          time_out,
      };

      console.log("Attempting to Check Out", payload);

      try {
          // Dispatch the action and wait for its completion if it's a thunk
          await dispatch(checkOut(payload));

          // Update state and localStorage upon success
          setStatusCheckIn(false);
          localStorage.removeItem("statusCheckIn");

          console.log("Successfully Checked Out:", payload);
      } catch (error) {
          console.error("Error during Check Out:", error);
      }
  };


    useEffect(() => {
        // Use async function within useEffect to handle async dispatch
        const fetchAssignedSchedule = async () => {
            try {
                const id = localStorage.getItem("employee_id");
                if (id) {
                    // Dispatch the action and wait for it to resolve
                    await dispatch(assignedShechule(id));
                }
            } catch (error) {
                console.error("Error fetching assigned schedule:", error);
            }
        };

        fetchAssignedSchedule();
    }, [dispatch]);

    useEffect(() => {
        if (Array.isArray(dataa) && dataa.length > 0) {
            const generatedDates = generateDates();

            const updatedDates = generatedDates.map((dateItem) => {
                let updatedItem = { ...dateItem };

                dataa.forEach((schedule) => {
                    const scheduleStartDate = moment(schedule.start_date);
                    const scheduleEndDate = moment(schedule.end_date);

                    if (
                        scheduleStartDate.isSameOrBefore(
                            dateItem.date,
                            "day"
                        ) &&
                        scheduleEndDate.isSameOrAfter(dateItem.date, "day")
                    ) {
                        const scheduleExists = updatedItem.schedules.some(
                            (existingSchedule) =>
                                existingSchedule.schedule_id ===
                                schedule.schedule_id
                        );

                        if (!scheduleExists) {
                            updatedItem.schedules.push({
                                schedule_id: schedule.schedule_id,
                                start_time: moment(
                                    schedule.schedule.start_time,
                                    "HH:mm:ss"
                                ).format("hh:mm A"),
                                end_time: moment(
                                    schedule.schedule.end_time,
                                    "HH:mm:ss"
                                ).format("hh:mm A"),
                                name: schedule.schedule.name,
                            });
                        }
                    }
                });

                return updatedItem;
            });

            setData(updatedDates);
        } else {
            // If no data fetched, just display generated dates
            setData(generateDates());
        }
    }, [dataa]);

    const columns = [
        {
            title: "Date",
            dataIndex: "displayDate",
            key: "displayDate",
        },
        {
            title: "Schedule",
            dataIndex: "schedules",
            key: "schedules",
            render: (schedules) => {
                if (schedules.length === 0) return "No schedule";
                return schedules.map((schedule, index) => (
                    <div key={index}>
                        <strong>{schedule.name}</strong>: {schedule.start_time}{" "}
                        - {schedule.end_time}
                    </div>
                ));
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => {
                // Get current date and time
                const now = moment();

                // Check if current time falls within any of the schedules
                const isWithinSchedule = record.schedules.some((schedule) => {
                    const scheduleStartTime = moment(
                        `${record.date} ${schedule.start_time}`,
                        "YYYY-MM-DD hh:mm A"
                    );
                    const scheduleEndTime = moment(
                        `${record.date} ${schedule.end_time}`,
                        "YYYY-MM-DD hh:mm A"
                    );
                    return now.isBetween(scheduleStartTime, scheduleEndTime);
                });

                // Render buttons only if within a valid schedule
                if (record.schedules.length > 0 && isWithinSchedule) {
                    return (
                        <>
                            {!statusCheckIn ? (
                                <Button
                                    style={{ marginRight: "10px" }}
                                    type="primary"
                                    onClick={handleCheckIn}
                                >
                                    Check In
                                </Button>
                            ) : (
                                <Button type="primary" onClick={handleCheckOut}>
                                    Check Out
                                </Button>
                            )}
                        </>
                    );
                }

                return null; // Don't show any buttons if not within schedule
            },
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            pagination={false} // Remove pagination to show all dates in one view
            loading={loading} // Show loading spinner while fetching data
            style={{
                minWidth: 800,
                tableLayout: "fixed",
                overflowX: "auto",
                overflowY: "auto",
            }}
            scroll={{ x: "max-content", y: 500 }}
        />
    );
};

export default Index;
