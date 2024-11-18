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
    const dispatch=useDispatch();
   const {error,loading,employeedata} =useSelector((state)=>state.employee)
      console.log("Employeev vffvfv", employeedata);
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
        const response= await dispatch(sendInvite(values));
        // console.log('bedbed',response)
        // console.log('errnnf',response.payload)
        if(response.error){
            notification.error({
                message: "Error",
                description:
                    response?.payload?.data?.message ||
                    "Problem sending, Recheck and try again",
                duration: 3,
            });
        }
        else{
            notification.success({
                message: "Success",
                description:
                    response?.payload?.data?.message ||
                    "Invite sent successfully",
                duration: 3,
            });
        }
        hideModal(); // Close modal after submission
    };


 useEffect(() => {
     const code = localStorage.getItem("company_code");
  
     dispatch(allEmployee(code));
 }, [dispatch]);

    return (
        <>
            <h1>Employee</h1>
            <Button
                text="Send Invite"
                onClick={showModal}
                style={{ backgroundColor: "Black", color: "white" }}
            />
            <Employe/>
            <SendInviteModal
                isVisible={isModalVisible}
                onSend={handleSendInvite}
                loading={loading}
                onCancel={hideModal}
            />
        </>
    );
};

export default Employee;
