import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import { Table, notification } from "antd";
import SendInviteModal from "./modal/EmployeeModal";
import { useDispatch } from "react-redux";
import { allEmployee, sendInvite } from "./redux/reducers";
import { useSelector } from "react-redux";
import Employe from "./services/employee";
const Employee = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const dispatch = useDispatch();
    const [Loading, setLoading] = useState(false);
    //    const {error,loading,employeedata} =useSelector((state)=>state.employee)

    // Show Modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    // Hide Modal
    const hideModal = () => {
        setIsModalVisible(false);
    };
    // Handle Form Submission
    const handleSendInvite = async (values) => {
        setLoading(true);
        try {
            const response = await dispatch(sendInvite(values));
            notification.success({
                message: "Success",
                description:
                    response?.payload?.data?.message ||
                    "Invite sent successfully",
                duration: 3,
            });
        } catch (error) {
            notification.error({
                message: "Error",
                description:
                    response?.payload?.data?.message ||
                    "Problem sending, Recheck and try again",
                duration: 3,
            });
        }
        hideModal();
    };

    return (
        <>
            <h1>Employee</h1>
            <Button
                text="Send Invite"
                onClick={showModal}
                style={{ backgroundColor: "Black", color: "white" }}
            />
            <Employe />
            <SendInviteModal
                isVisible={isModalVisible}
                onSend={handleSendInvite}
                loading={Loading}
                onCancel={hideModal}
            />
        </>
    );
};

export default Employee;
