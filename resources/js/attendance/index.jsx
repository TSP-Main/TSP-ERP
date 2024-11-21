import { Table, Button } from "antd";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { assignedShechule, checkIn, checkOut } from "./redux/reducer";
import Cookies from "js-cookie";

const Index = () => {
    const dispatch = useDispatch();
    const { dataa, loading } = useSelector((state) => state.assignedShechule);
    const [data, setData] = useState([]);
    const [statusCheckIn, setStatusCheckIn] = useState(false);

    // Generate dates starting from yesterday towards the next 7 days
    const generateDates = () => {
        const dates = [];
        const yesterday = moment().subtract(1, "days");

        for (let i = 0; i < 7; i++) {
            const date = moment(yesterday).add(i, "days");
            dates.push({
                key: i.toString(),
                date: date.format("YYYY-MM-DD"),
                displayDate: date.format("dddd, MMM DD"),
                schedules: [],
            });
        }
        return dates;
    };

    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    }

    const handleCheckIn = async () => {
        const id = localStorage.getItem("employee_id");
        const time_in = getCurrentTime();

        const payload = { id, time_in };

        try {
            await dispatch(checkIn(payload));
            setStatusCheckIn(true);
            Cookies.set("statusCheckIn", "true", { expires: 7 });
            console.log("Successfully Checked In:", payload);
        } catch (error) {
            console.error("Error during Check In:", error);
        }
    };

    const handleCheckOut = async () => {
        const id = localStorage.getItem("employee_id");
        const time_out = getCurrentTime();

        const payload = { id, time_out };

        try {
            await dispatch(checkOut(payload));
            setStatusCheckIn(false);
            Cookies.remove("statusCheckIn");
            console.log("Successfully Checked Out:", payload);
        } catch (error) {
            console.error("Error during Check Out:", error);
        }
    };

    useEffect(() => {
        const savedStatus = Cookies.get("statusCheckIn");
        if (savedStatus !== undefined) {
            setStatusCheckIn(savedStatus === "true");
        }
    }, []);

    useEffect(() => {
        const fetchAssignedSchedule = async () => {
            try {
                const id = localStorage.getItem("employee_id");
                if (id) {
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
            setData(generateDates());
        }
    }, [dataa]);

    // Auto Check Out Effect
    useEffect(() => {
        const interval = setInterval(() => {
            const now = moment();

            data.forEach((record) => {
                record.schedules.forEach((schedule) => {
                    const scheduleEndTime = moment(
                        `${record.date} ${schedule.end_time}`,
                        "YYYY-MM-DD hh:mm A"
                    );

                    if (
                        statusCheckIn &&
                        now.isSame(scheduleEndTime, "minute")
                    ) {
                       
                        handleCheckOut();
                         Cookies.remove(statusCheckIn);
                    }
                });
            });
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [data, statusCheckIn]);

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
                const now = moment();

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

                return null;
            },
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            loading={loading}
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
