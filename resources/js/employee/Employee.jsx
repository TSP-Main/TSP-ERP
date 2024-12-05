import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import { Table, notification } from "antd";
import SendInviteModal from "./modal/EmployeeModal";
import { useDispatch } from "react-redux";
import { allEmployee, sendInvite } from "./redux/reducers";
import { useSelector } from "react-redux";
import Employe from "./services/employee";
import { createManager } from "../manager/redux/reducer";
// import { createManager } from "../manager/redux/reducer";
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
   const handleSendInvite = async (values, selectedRole) => {
     console.log("values",values);
     
       setLoading(true);
       try {
           let response;
           if (selectedRole === "employee") {
               response = await dispatch(sendInvite(values));
           } else if (selectedRole === "manager") {
               response = await dispatch(createManager(values));
           }

           if (response?.error) {
               throw new Error("Failed to send invite");
           }

           notification.success({
               message: "Success",
               description: "Invite sent successfully",
               duration: 3,
           });
       } catch (error) {
           notification.error({
               message: "Error",
               description:
                   error.message || "Problem sending invite. Try again.",
               duration: 3,
           });
       } finally {
           setLoading(false);
           hideModal();
       }
   };

    return (
        <>
            <h1>Active Staff</h1>
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
