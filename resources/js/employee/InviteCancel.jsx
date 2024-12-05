import React, { useEffect } from "react";
import { Table, Spin,Alert } from "antd";
import { MdCancelPresentation } from "react-icons/md";
import { useDispatch,useSelector } from "react-redux";
import { cancelInvitedEmloyee } from "./redux/reducers";
import InvitedCanceledManagers from "../manager/InviteCanceledManagers";
const InvitCancel = () => {
    const dispatch=useDispatch();
   

    const { error, loading,  getCancelInvitedUsers } = useSelector(
        (state) => state.employee
    );
    console.log("Invited sbbwhs", getCancelInvitedUsers);
    const fetchCancelInvitedEmployees =async () =>{
        try{
            await dispatch(cancelInvitedEmloyee(localStorage.getItem("company_code")));
        }catch(error){
            notification.error({
                description: error || "Failed to get users",
                duration: 1.5,
            })
        }
    }
    useEffect(()=>{
        fetchCancelInvitedEmployees();
    },[])
       if (loading) return <Spin size="large" tip="Loading..." />;

       // Show error state
       if (error)
           return <Alert message="Error" description={error} type="error" />;

    
    return (
        <>
            <h1>Invite Cancel Employee</h1>
            <InvitedCanceledManagers/>

            <h4 style={{ textAlign: "center" }}>Employees</h4>
            <Table
                columns={columns} // Pass the columns here
                dataSource={getCancelInvitedUsers} // Pass the employee data here
                // rowKey={(record) => record.employee.company_code}
                pagination={false}
            />
        </>
    );
};
export const columns = [
    {
        title: "Name",
        dataIndex: ["user", "name"],
        key: "companyName",
    },
    {
        title: "Email",
        dataIndex: ["user", "email"],
        key: "companyEmail",
    },
    {
        title: "Manager",
        dataIndex: ["manager", "user", "name"],
        key: "manager",
    },

    // {
    //     title: "Actions",
    //     key: "actions",
    //     // render: (text, record) => (
    //     //     <div style={{ display: "flex", gap: "8px" }}>
    //     //         <Button
    //     //             style={{
    //     //                 border: "none",
    //     //                 color: "red",
    //     //             }}
    //     //             // onClick={() => onView(record.id)}
    //     //             icon={<MdCancelPresentation />}
    //     //         />
    //     //         {/* <Button icon={<MdDelete />} /> */}
    //     //     </div>
    //     // ),
    // },
];

export default InvitCancel;
