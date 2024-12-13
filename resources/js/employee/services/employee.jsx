import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { allEmployee, deleteEmployee, updateEmployee } from "../redux/reducers";
import Selection from "../../components/Selection";
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
    Flex,
} from "antd";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import {
    assignManager,
    changeManager,
    createManager,
    gettActiveManagers,
} from "../../manager/redux/reducer";
import Loading from "../../Loading";
import { ColumnHeightOutlined } from "@ant-design/icons";
import FilterComponent from "../../components/FilterComponent";

function Employee() {
    const [isChangeManagerModalOpen, setIsChangeManagerModalOpen] =
        useState(false);
    const [managerChange, setManagerChange] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isManagerDeleteOpen, setIsManagerDeleteOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [mmangerToDelete, setManagertoDelete] = useState(null);
    const [employeeToEdit, setEmployeeToEdit] = useState(null); // For editing employee
    const [editForm] = Form.useForm(); // Ant Design form instance for editing
    const { error, loading, employeedata } = useSelector(
        (state) => state.employee
    );
    const { activeManagersdata } = useSelector((state) => state.manager);
    const [managerRemove, setManagerRemove] = useState(null); // For deleting
    const [selectedRole, setSelectedRole] = useState("");
    const [managerTeam, setManagerTeam] = useState([]);
    const [selectedValue, setSelectedValue] = useState("Employee");
    const [filterText, setFilterText] = useState("");
    const handleSelectedValue = (value) => {
        setSelectedValue(value);
        console.log("Selected Value:", value); // You can perform other actions with the selected value
    };

    const dispatch = useDispatch();
    console.log("activeManagersdata", employeedata);
    // Fetch employees whenever the selected role changes

    // Handle filter changes
    const handleFilterChange = (value) => {
        setFilterText(value);
    };

    // Clear the filter text
    const handleClearFilter = () => {
        setFilterText("");
    };
    const filteredItemsM = useMemo(() => {
        return activeManagersdata.filter((item) =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(filterText.toLowerCase())
        );
    }, [activeManagersdata, filterText]);
    const filteredItems = useMemo(() => {
        return employeedata.filter((item) =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(filterText.toLowerCase())
        );
    }, [employeedata, filterText]);

    useEffect(() => {
        const code = localStorage.getItem("company_code");
        console.log("code", code);
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
                console.log("wedbeb");
                //  const code = localStorage.getItem("company_code");
                await dispatch(allEmployee({ code }));
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchEmployees();
    }, [dispatch]);

    // Show the delete confirmation modal

    // Handle delete action
    const handleDelete = async () => {
        try {
            const response = await dispatch(deleteEmployee(employeeToDelete));
            if (!response.error) {
                notification.success({
                    description: "Employee Deleted successfully",
                    duration: 2,
                });
                refetchEmployees();
                refetchManagers();
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

        await dispatch(allEmployee({ code })); // Dispatch the action to fetch employees
    };
    const refetchManagers = async () => {
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
            const response = await dispatch(updateEmployee(payload)); // Dispatch update action
            setIsEditModalOpen(false); // Close the modal
            setEmployeeToEdit(null); // Clear the state
            if (!response.error) {
                notification.success({
                    description: "Employee updated successfully",
                    duration: 2,
                });

                refetchManagers();
                refetchEmployees();
            }
        } catch (error) {
            notification.error({
                description: error || "Failed to update employee",
                duration: 2,
            });
        }
    };
    const showDeleteModal = (employeeId) => {
        setEmployeeToDelete(employeeId);
        setIsDeleteModalOpen(true);
    };
    const showManagerDeleteModal = async (id, user_id) => {
        console.log("id", id, "user_id", user_id);
        const code = localStorage.getItem("company_code");
        const response = await dispatch(allEmployee({ code, id }));
        console.log("response", response.payload);
        setManagerTeam(response.payload);
        setManagertoDelete(user_id);
        setManagerRemove(id);
        setIsManagerDeleteOpen(true);
    };

    const handleChangeManager = async () => {
        if (!managerChange?.manager_id || !managerChange?.id) {
            notification.error({
                description: "Please select a manager and an employee",
                duration: 2,
            });
            return;
        }

        const payload = {
            employee_id: managerChange.id,
            manager_id: managerChange.manager_id,
        };
        console.log("Update Manager", payload);

        try {
            // Send the payload to the API
            const response = await dispatch(assignManager(payload)); // Dispatch the action
            if (!response.error) {
                notification.success({
                    description: "Manager updated successfully",
                    duration: 2,
                });
                refetchEmployees(); // Refresh employees list
                refetchManagers();
            }
        } catch (error) {
            notification.error({
                description: error || "Failed to update manager",
                duration: 2,
            });
        }

        setIsChangeManagerModalOpen(false);
    };

    const showManagerChangeModal = (id) => {
        setManagerChange({ id }); // Set the employee ID in the state
        setIsChangeManagerModalOpen(true);
    };

    const handleManagerDelete = async () => {
        if (managerTeam > 0) {
            if (!managerRemove || !managerChange?.manager_id) {
                notification.error({
                    description: "Please select a manager to assign the team.",
                    duration: 2,
                });
                return;
            }

            const manager_to_remove = managerRemove; // Manager to be removed
            const manager_to_add = managerChange.manager_id; // New manager to assign the team to
            console.log("Manager to be removed: " + manager_to_remove);
            console.log("Manager to be added: " + manager_to_add);

            try {
                // Send the payload to the changeManager API
                const response = await dispatch(
                    changeManager({ manager_to_remove, manager_to_add })
                );
                if (!response.error) {
                    notification.success({
                        description: "manager reassigned successfully",
                        duration: 1.5,
                    });
                    const res = await dispatch(deleteEmployee(mmangerToDelete));
                    if (!res.error) {
                        notification.success({
                            description:
                                "Manager Reassigned and Deleted Successfully",
                            duration: 1.5,
                        });
                    }
                    // Refresh employees and managers lists after successful reassignment
                    await refetchEmployees();
                    await refetchManagers();
                } else {
                    throw new Error(
                        response.error.message || "Failed to reassign manager"
                    );
                }
            } catch (error) {
                notification.error({
                    description: error.message || "Failed to reassign manager",
                    duration: 2,
                });
            }
        } else {
            try {
                const res = await dispatch(deleteEmployee(mmangerToDelete));
                if (!res.error) {
                    notification.success({
                        description: "Manager Deleted Successfully",
                        duration: 1.5,
                    });
                    await refetchEmployees();
                    await refetchManagers();
                }
            } catch (error) {
                notification.error({
                    description: "Manager Deleted failed",
                    duration: 1.5,
                });
            }
        }

        // Reset state and close modal
        setIsManagerDeleteOpen(false);
        setManagertoDelete(null);
        setManagerChange(null);
    };
    const columnsM = [
        {
            title: "Name",
            dataIndex: ["user", "name"],
            key: "name",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
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
                        onClick={() =>
                            showManagerDeleteModal(record?.id, record?.user_id)
                        }
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
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Manager",
            dataIndex: ["manager", "user", "name"],
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
                    <Button onClick={() => showManagerChangeModal(record?.id)}>
                        Change Manager
                    </Button>
                </div>
            ),
        },
    ];
    const handleManagerSelect = (value) => {
        setManagerChange((prev) => ({
            ...prev,
            manager_id: value, // Set the selected manager ID
        }));
    };
    // Show loading state
    if (loading) return <Loading />;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    // Render the Table with data and role filter
    return (
        <>
            <Flex style={{ justifyContent: "space-between" }}>
                <Selection onSelect={handleSelectedValue} />
                <FilterComponent
                    style={{
                        // marginBottom: "16px",
                        display: "flex",
                        flexDirection: "row-reverse",
                        justifyContent: "flex-end",
                        alignItems: "flex-start",
                    }}
                    filterText={filterText}
                    onFilter={handleFilterChange}
                    onClear={handleClearFilter}
                />
            </Flex>
            <hr />

            {/**/}
            {selectedValue === "Manager" && (
                <>
                    <Table
                        columns={columnsM}
                        dataSource={filteredItemsM}
                        rowKey={(record) => record.id}
                        // title={() => <h4 style={{ textAlign: "center" }}>Managers</h4>}
                        pagination={true}
                    />
                </>
            )}
            {selectedValue === "Employee" && (
                <Table
                    columns={columns}
                    dataSource={filteredItems}
                    rowKey={(record) => record.id}
                    // title={() => <h4 style={{ textAlign: "center" }}>Employees</h4>}
                    pagination={false}
                />
            )}

            <Modal
                title="Change Manager"
                open={isChangeManagerModalOpen}
                onOk={handleChangeManager}
                onCancel={() => setIsChangeManagerModalOpen(false)}
            >
                <Form form={editForm} layout="vertical">
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
                        <Select
                            placeholder="Select Manager"
                            onChange={handleManagerSelect}
                        >
                            {Array.isArray(activeManagersdata) &&
                            activeManagersdata.length > 0 ? (
                                activeManagersdata.map((manager) => (
                                    <Select.Option
                                        key={manager.id}
                                        value={manager.id}
                                    >
                                        {manager.user.name}
                                    </Select.Option>
                                ))
                            ) : (
                                <Select.Option disabled value="">
                                    No Managers Available
                                </Select.Option>
                            )}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Delete Manager"
                open={isManagerDeleteOpen}
                onOk={handleManagerDelete}
                onCancel={() => setIsManagerDeleteOpen(false)}
            >
                {managerTeam.length > 0 && (
                    <p>
                        <p>The Manager is assigned to the below Team</p>

                        {(managerTeam || []).map((manager) => (
                            <p key={manager.id}>
                                <ul>
                                    <li> {manager.user.name}</li>
                                </ul>
                            </p>
                        ))}
                        <p>Change the Manager for whole Team</p>
                        <Select
                            placeholder="Select Manager"
                            onChange={handleManagerSelect}
                        >
                            {Array.isArray(activeManagersdata) &&
                            activeManagersdata.length > 0 ? (
                                activeManagersdata.map((manager) => (
                                    <Select.Option
                                        key={manager.id}
                                        value={manager.id}
                                    >
                                        {manager.user.name}
                                    </Select.Option>
                                ))
                            ) : (
                                <Select.Option disabled value="">
                                    No Managers Available
                                </Select.Option>
                            )}
                        </Select>
                    </p>
                )}
            </Modal>
            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Deletion"
                open={isDeleteModalOpen}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            >
                <p>Are you sure you want to delete this employee?</p>
                {/* {managerTeam.map((manager) => (
                    <p key={manager.id}>{manager.user.name}</p>
                ))} */}
            </Modal>
            {/* Edit Employee Modal */}
            <Modal
                title="Edit Employee"
                open={isEditModalOpen}
                onOk={handleEdit}
                onCancel={() => setIsEditModalOpen(false)}
            >
                <p>Select Manager</p>
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
