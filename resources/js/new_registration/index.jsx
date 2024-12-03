import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Spin, Alert, Button, notification, Tooltip, Modal } from "antd";
import { inactiveEmployee, userReject } from "./redux/reducer";
import { approveUserAction,inactiveUsersData } from "../company/redux/reducer";
import { newSignups } from "../employee/redux/reducers";
import { SiTicktick } from "react-icons/si";
import { RxCross1 } from "react-icons/rx";
// import { useDispatch } from "react-redux";
// import { inactiveUsersData, approveUserAction } from "./redux/reducer";

const InActive = () => {
     const dispatched = useDispatch();
    // const { error, loading, data } = useSelector(
    //     (state) => state.inactive
    // );
   const { error, loading,newsignupsdata } = useSelector((state) => state.employee)
    console.log("inactive seeee", newsignupsdata);
   const handleApprove = (id) => {
       Modal.confirm({
           title: "Confirm Approval",
           content: "Are you sure you want to approve this user?",
           okText: "Yes",
           cancelText: "No",
           onOk: async () => {
               try {
                   console.log("user id", id);
                   const response = await dispatched(approveUserAction(id));
                   if(!response.error){
                    notification.success({
                       message: "Success",
                       description: "User approved successfully.",
                       duration: 3,
                   });
                   fetchEmployees();
                }
               } catch (error) {
                   notification.error({
                       message: "Error",
                       description: error || "Failed to approve user.",
                       duration: 3,
                   });
               }
           },
       });
   };    
   const handleRejected = (id) => {
       Modal.confirm({
           title: "Confirm Rejection",
           content: "Are you sure you want to reject this user?",
           okText: "Yes",
           cancelText: "No",
           onOk: async () => {
               try {
                   const response = await dispatched(userReject(id));
                   if (!response.error) {
                       notification.success({
                           description: "User rejected successfully.",
                           duration: 1.5,
                       });
                       fetchEmployees();
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

    const fetchEmployees=()=>{
         const code = localStorage.getItem("company_code");
         const response = dispatched(newSignups(code));
         console.log("In active employee dispatch", response);
    }
    useEffect(()=>{
       
        fetchEmployees();
    },[])

    // Define table columns
    const columns = [
        {
            title: "Employee Name",
            dataIndex: ["user", "name"], // Access nested 'name' in 'company'
            key: "name",
        },
        {
            title: " Email",
            dataIndex: ["user", "email"], // Access 'email' directly from main object
            key: "Email",
        },
        {
            title: "Company Code",
            dataIndex: "company_code", // Access nested 'code' in 'company'
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
                            onClick={() => handleApprove(record?.user_id)}
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

    // if (loading)
    //     return (
    //         <Spin
    //             tip="Loading data..."
    //             size="large"
    //             style={{
    //                 alignContent: "center",
    //             }}
    //         />
    //     );

    // if (error)
    //     return (
    //         <Alert message="Error" description={error} type="error" showIcon />
    //     );

    return (
        <div>
            <h1>New Registrations</h1>
            <Table
                columns={columns}
                 dataSource={newsignupsdata}
                rowKey={(record) => record.id} // Use 'company.code' as unique key
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default InActive;
