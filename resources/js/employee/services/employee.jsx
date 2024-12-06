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
import { gettActiveManagers } from "../../manager/redux/reducer";

function Employee() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [employeeToEdit, setEmployeeToEdit] = useState(null); // For editing employee
    const [editForm] = Form.useForm(); // Ant Design form instance for editing
    const { error, loading, employeedata } = useSelector(
        (state) => state.employee
    );
    const {activeManagersdata}=useSelector((state)=>state.manager)
    const [selectedRole, setSelectedRole] = useState("");

    const dispatch = useDispatch();

    // Fetch employees whenever the selected role changes

    useEffect(() => {
         const code = localStorage.getItem("company_code");
         console.log("code",code)
        const fetchManagers = async () => {
            try {
               
                await dispatch(gettActiveManagers(code));
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchManagers();
         const fetchEmployees = async () => {
             try {
                  console.log("wedbeb")
                //  const code = localStorage.getItem("company_code");
                 await dispatch(allEmployee({code}));
             } catch (error) {
                 console.error("Error fetching employees:", error);
             }
         };

         fetchEmployees();
    }, [dispatch]);

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
                 refetchManagers()
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
   
    await dispatch(allEmployee(code)); // Dispatch the action to fetch employees
};
const refetchManagers = async () => {
    const code = localStorage.getItem("company_code");

    await dispatch(gettActiveManagers(code)); // Dispatch the action to fetch employees
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
                 refetchManagers()
            }
           
        } catch (error) {
            notification.error({
                description: error || "Failed to update employee",
                duration: 2,
            });
        }
    };
    const columnsM = [
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
            title:"Manager",
            dataIndex:["manager","user","name"],
            key: "manager",
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

    // Show loading state
    if (loading) return <Spin size="large" tip="Loading..." />;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    // Render the Table with data and role filter
    return (
        <>
            <h4 style={{ textAlign: "center" }}>Manager</h4>
            <Table
                columns={columnsM}
                dataSource={activeManagersdata}
                rowKey={(record) => record.id}
                pagination={false}
            />
            <h4 style={{ textAlign: "center" }}>Employees</h4>
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
