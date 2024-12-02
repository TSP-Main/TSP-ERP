import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { allEmployee, deleteEmployee, updateEmployee } from "../redux/reducers";
import {
    Table,
    Spin,
    Alert,
    Select,
    Button,
    Modal,
    Form,
    Input,
    notification,
} from "antd";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function Employee() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [employeeToEdit, setEmployeeToEdit] = useState(null); // For editing employee
    const [editForm] = Form.useForm(); // Ant Design form instance for editing
    const { error, loading, employeedata } = useSelector(
        (state) => state.employee
    );
    const [selectedRole, setSelectedRole] = useState("");

    const dispatch = useDispatch();

    // Fetch employees whenever the selected role changes
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const code = localStorage.getItem("company_code");
                const payload = {
                    role: selectedRole,
                    code: code,
                };
                await dispatch(allEmployee(payload));
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchEmployees();
    }, [dispatch, selectedRole]);

    // Show the delete confirmation modal
    const showDeleteModal = (employeeId) => {
        setEmployeeToDelete(employeeId);
        setIsDeleteModalOpen(true);
    };

    // Handle delete action
    const handleDelete = async () => {
        try {
            const response=await dispatch(deleteEmployee(employeeToDelete));
             if (!response.error) {
                 notification.success({
                     description: "Employee Deleted successfully",
                     duration: 2,
                 });
                 refetchEmployees()
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
const refetchEmployees = async () => {
    const code = localStorage.getItem("company_code");
    const payload = {
        role: selectedRole,
        code: code,
    };
    await dispatch(allEmployee(payload)); // Dispatch the action to fetch employees
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
            const response=await dispatch(updateEmployee(payload)); // Dispatch update action
            setIsEditModalOpen(false); // Close the modal
            setEmployeeToEdit(null); // Clear the state
            if(!response.error){
                 notification.success({
                     description: "Employee updated successfully",
                     duration: 2,
                 });
                 refetchEmployees()
            }
           
        } catch (error) {
            notification.error({
                description: error || "Failed to update employee",
                duration: 2,
            });
        }
    };

    // Define columns for the Ant Design table
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
                        onClick={() => showEditModal(record)}
                    />
                    <Button
                        icon={<MdDelete />}
                        onClick={() => showDeleteModal(record?.user_id)}
                    />
                </div>
            ),
        },
    ];

    // Show loading state
    if (loading) return <Spin size="large" tip="Loading..." />;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    // Render the Table with data and role filter
    return (
        <>
            <Select
                value={selectedRole}
                placeholder="Filter by Role"
                style={{
                    marginBottom: "10px",
                    width: "20%",
                }}
                onChange={(value) => setSelectedRole(value)}
            >
                <Select.Option value="">All Roles</Select.Option>
                <Select.Option value="employee">Employee</Select.Option>
                <Select.Option value="manager">Manager</Select.Option>
            </Select>
            <Table
                columns={columns}
                dataSource={employeedata}
                rowKey={(record) => record.id}
                pagination={false}
            />
            {/* Delete Confirmation Modal */}
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
        </>
    );
}

export default Employee;
