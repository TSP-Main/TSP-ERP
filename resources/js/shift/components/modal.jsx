import React, { useEffect } from "react";
import { Modal, Form, Input, TimePicker, Select,notification } from "antd";
import { useDispatch,useSelector } from "react-redux";
import { createSchedule } from "../redux/reducer";

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const ShiftModal = ({ isVisible, onCancel }) => {
    const {error}=useSelector((state)=>state.schedule);
    const dispatch=useDispatch();
    const [form] = Form.useForm();

    const formatTime = (time) => {
        if (!time) return null;
        const hours = time.hour();
        const minutes = time.minute();
        const seconds = time.second();
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleFormSubmit = async(values) => {
        const formattedValues = {
            ...values,
            start_time: formatTime(values.start_time),
            end_time: formatTime(values.end_time),
        };
        console.log("Form Submitted:", formattedValues);
        const response=await dispatch(createSchedule(formattedValues));
        console.log(response?.payload?.data?.message)
        if(response.error){
            notification.error({
                message: "Error",
                description:
                    response?.payload?.data?.message ||
                    "Problem Creating, Recheck and try again",
                duration: 3,
            });
        }
        else{
            notification.success({
                message: "Success",
                description: response?.message || "Shift created successfully",
                duration: 3,
            });
            
            onCancel();
            window.location.reload();
        }
    }

    useEffect(() => {
        const id = localStorage.getItem("company_id");
        form.setFieldsValue({ company_id: id });
    }, [form]);
    // if(error)
    //     return <h1>No schedule found</h1>

    return (
        <Modal
            title="Create Shift"
            open={isVisible}
            onOk={() => form.submit()} // Trigger onFinish with form.submit()
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            okText="Create"
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                {/* Hidden company_id field */}
                <Form.Item name="company_id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Shift Name"
                    rules={[
                        {
                            required: true,
                            message: "Please enter the shift name",
                        },
                    ]}
                >
                    <Input placeholder="Enter shift name" />
                </Form.Item>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <Form.Item
                        name="start_time"
                        label="Start Time"
                        rules={[
                            {
                                required: true,
                                message: "Please select a start time",
                            },
                        ]}
                    >
                        <TimePicker
                            format="HH:mm"
                            placeholder="Select Start Time"
                        />
                    </Form.Item>

                    <Form.Item
                        name="end_time"
                        
                        label="End Time"
                        rules={[
                            {
                                required: true,
                                message: "Please select an end time",
                            },
                        ]}
                    >
                        <TimePicker
                            format="HH:mm"
                            placeholder="Select End Time"
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="week_day"
                    label="Days of the Week (optional)"
                    rules={[{ required: false, message: "Please select days" }]}
                >
                    <Select
                        placeholder="Select days"
                        options={daysOfWeek.map((day) => ({
                            label: day,
                            value: day,
                        }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ShiftModal;
