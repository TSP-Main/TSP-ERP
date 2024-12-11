import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import { Modal, Table, notification } from "antd";
import SendInviteModal from "./modal/EmployeeModal";
import { useDispatch } from "react-redux";
import { allEmployee, sendInvite } from "./redux/reducers";
import { useSelector } from "react-redux";
import Employe from "./services/employee";
import { createManager } from "../manager/redux/reducer";
import { total } from "../new_registration/redux/reducer";
// import { createManager } from "../manager/redux/reducer";
const Employee = () => {
    const [istotal, setTotal] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const dispatch = useDispatch();
    const [Loading, setLoading] = useState(false);
    //    const {error,loading,employeedata} =useSelector((state)=>state.employee)
    const refetchEmployees = async () => {
        const code = localStorage.getItem("company_code");

        await dispatch(allEmployee(code)); // Dispatch the action to fetch employees
    };
    const fetchTotal = async () => {
        const response = await dispatch(
            total(localStorage.getItem("company_code"))
        );
        console.log("Fetch", response);
        setTotal(response.payload.total_user);
    };
    useEffect(() => {
        fetchTotal();
    });
    const refetchManagers = async () => {
        const code = localStorage.getItem("company_code");

        await dispatch(gettActiveManagers(code)); // Dispatch the action to fetch employees
    };
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
       console.log("values", values);

       setLoading(true);

       const sendInviteRequest = async () => {
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
           refetchManagers();
           hideModal();
       };

       try {
           if (istotal > 10) {
               Modal.confirm({
                   title: "Additional Charge Confirmation",
                   content:
                       "Your total employees exceed the limit of 10. Additional charges will apply. Do you wish to proceed?",
                   okText: "Yes, Proceed",
                   cancelText: "No, Cancel",
                   onOk: async () => {
                       try {
                           await sendInviteRequest();
                       } catch (error) {
                           notification.error({
                               message: "Error",
                               description:
                                   error.message ||
                                   "Problem sending invite. Try again.",
                               duration: 3,
                           });
                       } finally {
                           setLoading(false);
                       }
                   },
                   onCancel: () => {
                       setLoading(false); // Reset loading state if the user cancels
                   },
               });
           } else {
               await sendInviteRequest();
           }
       } catch (error) {
           notification.error({
               message: "Error",
               description:
                   error.message || "Problem sending invite. Try again.",
               duration: 3,
           });
       } finally {
           setLoading(false);
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
