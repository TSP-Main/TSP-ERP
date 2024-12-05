import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Table,
    Spin,
    Alert,
    Button,
    notification,
    Tooltip,
    Modal,
    Form,
    Select,
} from "antd";
import { userReject } from "./redux/reducer";
import { approveUserAction } from "../company/redux/reducer";
import { newSignups } from "../employee/redux/reducers"; // Ensure getActiveManagers is imported
import { SiTicktick } from "react-icons/si";
import { RxCross1 } from "react-icons/rx";
import { assignManager, gettActiveManagers } from "../manager/redux/reducer"; // Assuming getActiveManagers exists

const InActive = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [userId, setUserId] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [loadingModal, setLoadingModal] = useState(false); // For loading state in modal

    const dispatch = useDispatch();
    const { error, loading, newsignupsdata } = useSelector(
        (state) => state.employee
    );
    const { activeManagersdata } = useSelector((state) => state.manager); // Assuming you have this state for managers

    useEffect(() => {
        // Fetch new signups and active managers when component mounts
        const code = localStorage.getItem("company_code");
        dispatch(newSignups(code));
        dispatch(gettActiveManagers(code)); // Fetch active managers
    }, [dispatch]);

    const handleApprove = (id, employeeId) => {
        // Show modal when Approve button is clicked
        setUserId(id);
        setEmployeeId(employeeId);
        setIsModalVisible(true);
    };

    const handleRejected = (id) => {
        Modal.confirm({
            title: "Confirm Rejection",
            content: "Are you sure you want to reject this user?",
            okText: "Yes",
            cancelText: "No",
            onOk: async () => {
                try {
                    const response = await dispatch(userReject(id));
                    if (!response.error) {
                        notification.success({
                            description: "User rejected successfully.",
                            duration: 1.5,
                        });
                    }
                } catch (error) {
                    notification.error({
                        description: error || "Failed to reject user.",
                        duration: 1.5,
                    });
                }
            },
        });
    };

    const handleModalOk = async () => {
        if (!selectedManager) {
            notification.error({ message: "Please select a manager" });
            return;
        }

        setLoadingModal(true);

        try {
            // Call two APIs: one for assigning the manager, and another for approving the user
            await dispatch(approveUserAction(userId)); // Approve user
            const payload={
                employee_id: employeeId,
                manager_id: selectedManager,
            }
            // Pass both employeeId and selectedManager (managerId)
            await dispatch(assignManager(payload));

            notification.success({
                message: "Success",
                description: "User approved and manager assigned.",
                duration: 3,
            });
            setIsModalVisible(false); // Close modal
        } catch (error) {
            notification.error({
                message: "Error",
                description:
                    error.message ||
                    "Failed to approve user and assign manager.",
                duration: 3,
            });
        } finally {
            setLoadingModal(false);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: "Employee Name",
            dataIndex: ["user", "name"],
            key: "name",
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
        },
        {
            title: "Company Code",
            dataIndex: "company_code",
            key: "companyCode",
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <>
                    <Tooltip title="Approve User">
                        <Button
                            style={{
                                marginRight: "10px",
                                background: "green",
                                color: "white",
                            }}
                            onClick={() =>
                                handleApprove(record?.user_id, record?.id)
                            }
                        >
                            <SiTicktick />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Reject User">
                        <Button
                            style={{
                                background: "red",
                                color: "white",
                            }}
                            onClick={() => handleRejected(record?.user_id)}
                        >
                            <RxCross1 />
                        </Button>
                    </Tooltip>
                </>
            ),
        },
    ];

    return (
        <div>
            <h1>New Registrations</h1>
            <Table
                columns={columns}
                dataSource={newsignupsdata}
                rowKey={(record) => record.id}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal to assign manager */}
            <Modal
                title="Assign Manager and Approve User"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                confirmLoading={loadingModal}
                okText="Approve & Assign"
                cancelText="Cancel"
            >
                <Form layout="vertical">
                    <Form.Item
                        label="Select Manager"
                        name="manager"
                        rules={[
                            {
                                required: true,
                                message: "Please select a manager",
                            },
                        ]}
                    >
                        <Select
                            onChange={(value) => setSelectedManager(value)}
                            placeholder="Select a manager"
                        >
                            {activeManagersdata?.map((manager) => (
                                <Select.Option
                                    key={manager.id}
                                    value={manager.id}
                                >
                                    {manager.user.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default InActive;
