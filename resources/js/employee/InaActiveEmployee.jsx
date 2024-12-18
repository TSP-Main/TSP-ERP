import React, { useEffect } from "react";
import { Table, Button, notification, Spin,Alert } from "antd";
import { MdCancelPresentation } from "react-icons/md";
import { useDispatch } from "react-redux";
import {  inActiveEmployee,approveUserAction } from "./redux/reducers";
import { useSelector } from "react-redux";
import { TiTickOutline } from "react-icons/ti";
const InvitedEmployee = () => {
    const { error, loading, inactivedata } = useSelector(
        (state) => state.employee
    );
    console.log("inactive", inactivedata);
    const dispatch = useDispatch();
    const handleInactive = async (id) => {
        try {
             
             await dispatch(inActiveEmployee(localStorage.getItem("company_code")));
            }
        catch (error) {
            notification.error({
                description: error || "Failed to Fetch users",
                duration: 1.5,
            });
        }
    };
    // const handleStatusChange=(id)=>{
    //       console.log("user id", id);
    //       try {
    //           // const id=localStorage.getItem("company_id")
    //           console.log("user id", id);
    //           // Dispatch the action to approve the user
    //           dispatch(approveUserAction(id));
    //           console.log("inside try");
    //           notification.success({
    //               message: "Success",
    //               description: "User approved successfully.",
    //               duration: 3,
    //           });
    //           handleInactive();

    //           // Optionally refresh the inactive users data
    //           dispatched(inactiveUsersData());
    //       } catch (error) {
    //           notification.error({
    //               message: "Error",
    //               description: error || "Failed to approve user.",
    //               duration: 3,
    //           });
    //       }
    //   };
    useEffect(() => {
        handleInactive();
    }, []);
    const columns = [
        {
            title: "Name",
            dataIndex: ["user", "name"],
            key: "name",
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "companyEmail",
        },
        // {
        //     title: "Company Code",
        //     dataIndex: ["employee", "company_code"],
        //     key: "companyCode",
        // },
        // {
        //     title: "Actions",
        //     key: "actions",
        //     render: (text, record) => (
        //         <div style={{ display: "flex", gap: "8px" }}>
        //             <Tooltip title="Approve User" trigger={["hover", "focus"]}>
        //                 <Button
        //                     style={{
        //                         border: "none",
        //                         background: "green",
        //                         color: "white",
        //                     }}
        //                     onClick={() => handleStatusChange(record?.user_id)}
        //                     icon={<TiTickOutline />}
        //                 />
        //             </Tooltip>
        //             {/* <Button icon={<MdDelete />} /> */}
        //         </div>
        //     ),
        // },
    ];
       if (loading) return <Spin size="large" tip="Loading..." />;

       // Show error state
       if (error)
           return <Alert message="Error" description={error} type="error" />;

    if (loading) return <Spin />;
    return (
        <>
            <h1>In Active Employee</h1>
            <Table
                columns={columns} // Pass the columns here
                dataSource={inactivedata} // Pass the employee data here
                // rowKey={(record) => record.employee.company_code}
                pagination={false}
            />
        </>
    );
};

export default InvitedEmployee;
