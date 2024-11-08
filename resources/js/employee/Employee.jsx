import React, { useState } from "react";
import Button from "../components/Button";
import { columns } from "./services/employee";
import { Table, notification } from "antd";
import SendInviteModal from "./modal/EmployeeModal";

const Employee = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Show Modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    // Hide Modal
    const hideModal = () => {
        setIsModalVisible(false);
    };

    // Handle Form Submission
    const handleSendInvite = (values) => {
        console.log("Form Values:", values);
        notification.success({
            message: "Invite Sent",
            description: `An invite has been sent to ${values.email}.`,
        });
        hideModal(); // Close modal after submission
    };

    return (
        <>
            <h1>Employee</h1>
            <Button
                text="Send Invite"
                onClick={showModal}
                style={{ backgroundColor: "Black", color: "white" }}
            />
            <Table columns={columns} pagination={{ pageSize: 10 }} />
            <SendInviteModal
                isVisible={isModalVisible}
                onSend={handleSendInvite}
                onCancel={hideModal}
            />
        </>
    );
};

export default Employee;
