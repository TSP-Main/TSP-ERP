import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    notification,
    TimePicker,
} from "antd";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { assignedShechule, checkIn, checkOut, isCheckIn, postEmployeeAvailability } from "./redux/reducer";
import Cookies from "js-cookie";
import { get } from "react-hook-form";

const Index = () => {
    console.log("attendance");
    const dispatch = useDispatch();
    const { dataa, loading } = useSelector((state) => state.assignedShechule);
    const [data, setData] = useState([]);
    const [statusCheckIn, setStatusCheckIn] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Handle modal open
    const handleOpenModal = (record) => {
        const selectedDate = moment(record.date, "YYYY-MM-DD").format(
            "YYYY-MM-DD"
        );
        console.log(selectedDate);
        setIsModalVisible(true);
    };

    // Handle modal close
    const handleCloseModal = () => {
        setIsModalVisible(false);
        form.resetFields(); // Reset form fields when the modal is closed
    };

    // Handle form submission
    const handleFormSubmit =async (values) => {
        const id = localStorage.getItem("employee_id");
        const formattedData = {
            employee_id: id,
            date: values.date.format("YYYY-MM-DD"),
            start_time: values.start_time.format("HH:mm"),
            end_time: values.end_time.format("HH:mm"),
        };

        console.log("Submitted Data:", formattedData);
         try {
             const response = await dispatch(
                 postEmployeeAvailability(formattedData)
             ).unwrap(); // Use `.unwrap()` for cleaner error handling
             notification.success({
                 description:
                     response?.message || "Schedule created successfully",
                 duration: 3,
             });
             handleCloseModal(); // Close modal on success
         } catch (error) {
            console.log(error)
             notification.error({
                 description:
                     error || "Something went wrong. Please try again.",
                 duration: 3,
             });
         }

        // Perform API call here
        // Example: await dispatch(changeSchedule(formattedData));

       // Close the modal after submission
    };
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
        // const time_in = getCurrentTime();

       
        try {
            await dispatch(checkIn(id));
            setStatusCheckIn(true);
           
            // console.log("Successfully Checked In:", payload);
        } catch (error) {
            console.error("Error during Check In:", error);
        }
    };

    const handleCheckOut = async () => {
        const id = localStorage.getItem("employee_id");
        // const time_out = getCurrentTime();

       
        //  console.log("payload check out", payload);


        try {
            await dispatch(checkOut(id));
            setStatusCheckIn(false);
           
            // console.log("Successfully Checked Out:", payload);
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
    const getCheckInStatus=async()=>{
        try{
            console.log("Getting check in status")
            const response=await dispatch(isCheckIn(localStorage.getItem('employee_id')))
            console.log("checkout response",response)
            if(response?.status=="present"){
               setStatusCheckIn(true)
            } 
            else if(response?.status=="absent"){
                setStatusCheckIn(false)
            }
        }catch(error){
                console.log("err0r ejjenc",error)
        }
    }
    useEffect(()=>{
        console.log("getCheckInStatus")
        getCheckInStatus()
    },[])
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
                // const today = moment().format("YYYY-MM-DD") === record.date;

                // Check if any schedule is active
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

                // Disable button if not within the schedule time or not today
                const shouldDisableButton = !isWithinSchedule;

                if (record.schedules.length > 0) {
                    return (
                        <>
                            {!statusCheckIn ? (
                                <Button
                                    style={{ marginRight: "10px" }}
                                    type="primary"
                                    onClick={handleCheckIn}
                                    disabled={shouldDisableButton}
                                    title="Can only CheckIn/Out in assigned Schedule Time"
                                >
                                    Check In
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={handleCheckOut}
                                    disabled={shouldDisableButton}
                                    title="Can only CheckIn/Out in assigned Schedule Time"
                                >
                                    Check Out
                                </Button>
                            )}
                            <Button
                                type="primary"
                                onClick={() => handleOpenModal(record)}
                            >
                                Change Schedule
                            </Button>
                            
                        </>
                    );
                }

                return null;
            },
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                loading={loading}
                // scroll={{ x: 0, y: 0}}
                // style={{
                //     minWidth: 800,
                //     tableLayout: "fixed",
                //     overflowX: "auto",
                //     overflowY: "auto",
                // }}
                // scroll={{ x: "max-content", y: 500 }}
            />
            <Modal
                title="Change Schedule"
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={null} // Use the form's submit button for actions
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{
                        employee_id: 1, // Default employee ID
                        date: moment(), // Default date to today
                        start_time: moment("09:00", "HH:mm"),
                        end_time: moment("17:00", "HH:mm"),
                    }}
                >
                    <Form.Item
                        label="Date"
                        name="date"
                        rules={[
                            {
                                required: true,
                                message: "Please select the date!",
                            },
                        ]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            disabledDate={(current) =>
                                current && current < moment().startOf("day")
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label="Start Time"
                        name="start_time"
                        rules={[
                            {
                                required: true,
                                message: "Please select the start time!",
                            },
                        ]}
                    >
                        <TimePicker style={{ width: "100%" }} format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                        label="End Time"
                        name="end_time"
                        rules={[
                            {
                                required: true,
                                message: "Please select the end time!",
                            },
                        ]}
                    >
                        <TimePicker style={{ width: "100%" }} format="HH:mm" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ marginRight: "8px" }}
                        >
                            Submit
                        </Button>
                        <Button onClick={handleCloseModal}>Cancel</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Index;
