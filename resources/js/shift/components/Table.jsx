import React, { useEffect, useState } from "react";
import {
    Table,
    Spin,
    Alert,
    Button,
    Modal,
    Form,
    Input,
    notification,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
    showSchedule,
    deleteSchedule,
} from "../redux/reducer";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const ScheduleTable = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState(null); // For editing
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [editForm] = Form.useForm(); // Ant Design form instance
    const dispatch = useDispatch();
    const { error, loading, scheduledata } = useSelector(
        (state) => state.schedule
    );

    // Fetch schedules on component mount
    useEffect(() => {
        const id = localStorage.getItem("company_id");
        if (id) {
            dispatch(showSchedule(id));
        } else {
            notification.error({
                message: "Error",
                description: "Company ID not found in localStorage.",
            });
        }
    }, [dispatch]);

    // Ensure scheduledata is an array
    const dataSource = Array.isArray(scheduledata) ? scheduledata : [];

    // Show Edit Modal
    const showEditModal = (record) => {
        setScheduleToEdit(record); // Set the schedule to edit
        editForm.setFieldsValue(record); // Pre-fill the form with schedule data
        setIsEditModalOpen(true);
    };

    // Handle Edit Submission
    const handleEdit = async () => {
        try {
            const updatedData = editForm.getFieldsValue(); // Get updated values
            const payload = {
                id: scheduleToEdit.id,
                payload: updatedData,
            };
            await dispatch(updateSchedule(payload));
            notification.success({
                description: "Schedule updated successfully.",
            });
            setIsEditModalOpen(false);
            setScheduleToEdit(null);
        } catch (error) {
            console.error("Error updating schedule:", error);
            notification.error({
                description: error || "Failed to update schedule.",
            });
        }
    };

    // Show Delete Modal
    const showDeleteModal = (id) => {
        setScheduleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // Handle Delete
    const handleDelete = async () => {
        try {
            await dispatch(deleteSchedule(scheduleToDelete));
            notification.success({
                message: "Success",
                description: "Schedule deleted successfully.",
            });
            setIsDeleteModalOpen(false);
            setScheduleToDelete(null);
        } catch (error) {
            console.error("Error deleting schedule:", error);
            notification.error({
                message: "Error",
                description: "Failed to delete schedule.",
            });
        }
    };

    // Table columns
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Start Time",
            dataIndex: "start_time",
            key: "start_time",
        },
        {
            title: "End Time",
            dataIndex: "end_time",
            key: "end_time",
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
                        onClick={() => showDeleteModal(record.id)}
                    />
                </div>
            ),
        },
    ];

    // Loading state
    if (loading) return <Spin size="large" tip="Loading..." />;

    // Error state
    if (error)
        return (
            <Alert
                message="Error"
                description={error || "No schedule data available."}
                type="error"
                showIcon
            />
        );

    return (
        <>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                rowKey="id"
            />
            {/* Delete Modal */}
            <Modal
                title="Confirm Deletion"
                open={isDeleteModalOpen}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            >
                <p>Are you sure you want to delete this schedule?</p>
            </Modal>
            {/* Edit Modal */}
            <Modal
                title="Edit Schedule"
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
                        label="Start Time"
                        name="start_time"
                        rules={[
                            {
                                required: true,
                                message: "Start time is required",
                            },
                        ]}
                    >
                        <Input placeholder="HH:MM:SS" />
                    </Form.Item>
                    <Form.Item
                        label="End Time"
                        name="end_time"
                        rules={[
                            {
                                required: true,
                                message: "End time is required",
                            },
                        ]}
                    >
                        <Input placeholder="HH:MM:SS" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ScheduleTable;
