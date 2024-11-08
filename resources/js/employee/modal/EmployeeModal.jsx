import React from "react";
import { Modal, Form, Input, Select, notification,Flex } from "antd";

const EmployeeModal = ({ isVisible, onSend, onCancel }) => {
    const [form] = Form.useForm();

    // Handle Form Submission
    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSend(values); // Send form values to parent component
            form.resetFields();
        } catch (errorInfo) {
            console.error("Validation failed:", errorInfo);
        }
    };

    return (
        <Modal
            title="Send Invite"
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
                <Flex gap={4}>
                    <Form.Item
                        style={{ width: "30%" }}
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

                    <Form.Item
                        name="role"
                        style={{ width: "30%" }}
                        label="Role"
                        rules={[
                            { required: true, message: "Please select a role" },
                        ]}
                    >
                        <Select placeholder="Select role">
                            <Select.Option value="manager">
                                Manager
                            </Select.Option>
                            <Select.Option value="employee">
                                Employee
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Flex>
                <Flex gap={4}>
                    <Form.Item
                        name="companyCode"
                        label="Company Code"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the company code",
                            },
                        ]}
                    >
                        <Input placeholder="Enter company code" />
                    </Form.Item>
                </Flex>
            </Form>
        </Modal>
    );
};

export default EmployeeModal;
