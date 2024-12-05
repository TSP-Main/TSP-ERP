import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, notification } from "antd";
import { gettActiveManagers } from "../../manager/redux/reducer";
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch and useSelector

const EmployeeModal = ({ isVisible, onSend, onCancel }) => {
    const [form] = Form.useForm();
    const [company_Code, setCompanyCode] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [managers, setManagers] = useState([]); // State to store fetched managers

    const dispatch = useDispatch(); // Initialize dispatch function

    // Fetch managers when the modal is visible
    useEffect(() => {
        const company_code = localStorage.getItem("company_code");
        setCompanyCode(company_code);
        form.setFieldsValue({ company_code });

        if (isVisible) {
            fetchManagers(company_code);
        }
    }, [form, isVisible]);

    // Function to fetch managers from the API
    const fetchManagers = async (company_code) => {
        try {
            const response = await dispatch(gettActiveManagers(company_code));
            console.log("respons dhdfhdfe", response.payload);
            
            if (response && !response.error) {
                setManagers(response.payload); // Store the managers in the state
            } else {
                notification.error({
                    message: "Error fetching managers",
                    description: "Failed to fetch active managers.",
                });
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            notification.error({
                message: "Error",
                description:
                    error.message || "Failed to fetch active managers.",
            });
        }
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSend(values, selectedRole); // Pass form values and selected role to the parent
            form.resetFields();
        } catch (errorInfo) {
            console.error("Validation failed:", errorInfo);
        }
    };

    return (
        <Modal
            title="Add Employee"
            open={isVisible}
            onOk={handleFormSubmit}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            okText="Send"
            okButtonProps={{
                style: {
                    backgroundColor: "black",
                    color: "white",
                    borderRadius: "4px",
                    borderColor: "black",
                },
            }}
            cancelButtonProps={{
                style: {
                    color: "black",
                    borderColor: "black",
                },
            }}
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical">
                {/* First Row */}
                <div style={{ display: "flex", gap: "16px" }}>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="name"
                        label="Name"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="email"
                        label="Email"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the email",
                            },
                            {
                                type: "email",
                                message: "Please enter a valid email",
                            },
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>
                </div>

                {/* Company Code */}
                <Form.Item name="company_code" label="Company Code">
                    <Input value={company_Code} disabled />
                </Form.Item>

                {/* Role and Manager */}
                <div
                    style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "flex-end",
                    }}
                >
                    <Form.Item
                        style={{ flex: 1 }}
                        name="role"
                        label="Role"
                        rules={[
                            { required: true, message: "Please select a role" },
                        ]}
                    >
                        <Select
                            placeholder="Select role"
                            onChange={(value) => setSelectedRole(value)}
                        >
                            <Select.Option value="manager">
                                Manager
                            </Select.Option>
                            <Select.Option value="employee">
                                Employee
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    {selectedRole === "employee" && (
                        <Form.Item
                            style={{ flex: 1 }}
                            name="manager_id"
                            label="Manager"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a manager",
                                },
                            ]}
                        >
                            <Select placeholder="Select Manager">
                                {managers.map((manager) => (
                                    <Select.Option
                                        key={manager.id}
                                        value={manager.id}
                                    >
                                        {manager.user.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                </div>
            </Form>
        </Modal>
    );
};

export default EmployeeModal;
