import React, { useEffect, useState } from "react";
import { notification, Table, Modal, Form, Input, Select, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { allEmployeeM, gettActiveManagers } from "./redux/reducer";
import { deleteEmployee, sendInvite, updateEmployee } from "../employee/redux/reducers";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const Index = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [employeeToEdit, setEmployeeToEdit] = useState(null); // For editing employee
    const [editForm] = Form.useForm(); // Ant Design form instance for editing
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm(); // Ant Design Form instance
    const [selectedRole, setSelectedRole] = useState("employee");
    const [managers, setManagers] = useState([]); // Example managers list
    const [loading, setLoading] = useState(false); // For modal submit button
    const dispatch = useDispatch();

    const { activeEmployeedata } = useSelector((state) => state.manager);

    // Simulated company code
    const company_code = localStorage.getItem("company_code");

    const fetchEmployees = async () => {
        const payload = {
            code: company_code,
            id: localStorage.getItem("manager_id"),
        };
        try {
            const response=await dispatch(allEmployeeM(payload));
            console.log("response all",response.payload)
            
        } catch (error) {
            notification.error({
                message: error.response?.errors || "Failed to fetch data",
            });
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const hideModal = () => {
        setIsModalVisible(false);
        form.resetFields(); // Reset form fields on modal close
    };
    const showDeleteModal = (employeeId) => {
        setEmployeeToDelete(employeeId);
        setIsDeleteModalOpen(true);
    };

    // Handle delete action
    const handleDelete = async () => {
        try {
            const response = await dispatch(deleteEmployee(employeeToDelete));
            if (!response.error) {
                notification.success({
                    description: "Employee Deleted successfully",
                    duration: 2,
                });
                fetchEmployees();
            }
        } catch (error) {
            notification.error({
                description: error || "Failed to delete employee",
                duration: 2,
            });
        }

        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    // Show the edit modal
    const showEditModal = (employee) => {
        setEmployeeToEdit(employee); // Store the selected employee
        editForm.setFieldsValue(employee); // Pre-fill the form with employee data
        setIsEditModalOpen(true); // Open the modal
    };
    // Handle edit submission
    const handleEdit = async () => {
        try {
            const updatedData = editForm.getFieldsValue(); // Get form data
            const payload = {
                id: employeeToEdit.id, // Pass the employee ID
                payload: updatedData, // Updated employee data
            };
            console.log("updared", payload);
            const response = await dispatch(updateEmployee(payload)); // Dispatch update action
            setIsEditModalOpen(false); // Close the modal
            setEmployeeToEdit(null); // Clear the state
            if (!response.error) {
                notification.success({
                    description: "Employee updated successfully",
                    duration: 2,
                });
            fetchEmployees();
               
            }
        } catch (error) {
            notification.error({
                description: error || "Failed to update employee",
                duration: 2,
            });
        }
    };

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload = {
                name: values.name,
                email: values.email,
                manager_id: localStorage.getItem("manager_id"),
                company_code: company_code,
                role: values.role,
            };

            // Mock API call to handle form submission
            console.log("Form Values:", payload);
            await dispatch(sendInvite(payload));

            notification.success({
                message: "Success",
                description: "Employee added successfully",
                duration: 3,
            });

            hideModal();
        } catch (error) {
            console.error("Form Validation Failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: ["user", "name"],
            key: "name",
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                        icon={<FaEdit />}
                        onClick={() => showEditModal(record.user)}
                    />
                    <Button
                        icon={<MdDelete />}
                        onClick={() => showDeleteModal(record?.user_id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1>Active Employees</h1>
                <Button
                    type="primary"
                    onClick={showModal}
                    style={{ backgroundColor: "Black", color: "white" }}
                >
                    Send Invite
                </Button>
            </div>
            <Modal
                title="Add Employee"
                open={isModalVisible}
                onOk={handleFormSubmit}
                onCancel={hideModal}
                okText="Send"
                okButtonProps={{
                    loading: loading,
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
                    <Form.Item name="company_code" label="Company Code">
                        <Input
                            value={company_code}
                            placeholder={company_code}
                            disabled
                        />
                    </Form.Item>
                    <div style={{ display: "flex", gap: "16px" }}>
                        <Form.Item
                            style={{ flex: 1 }}
                            name="role"
                            label="Role"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a role",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Select role"
                                onChange={(value) => setSelectedRole(value)}
                            >
                                <Select.Option value="employee">
                                    Employee
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <Table
                columns={columns}
                dataSource={activeEmployeedata}
                rowKey={(record) => record.id}
            />
            <Modal
                title="Confirm Deletion"
                open={isDeleteModalOpen}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            >
                <p>Are you sure you want to delete this employee?</p>
            </Modal>
            {/* Edit Employee Modal */}
            <Modal
                title="Edit Employee"
                open={isEditModalOpen}
                onOk={handleEdit}
                onCancel={() => setIsEditModalOpen(false)}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: "Name is required" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Email is required" },
                            { type: "email", message: "Invalid email format" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Index;
