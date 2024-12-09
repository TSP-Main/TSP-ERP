import React, { useEffect } from "react";
import { Table, Button,Spin,Alert } from "antd";
import { TiTick } from "react-icons/ti";
import { useDispatch,useSelector } from "react-redux";
import { getRejectedUser } from "./redux/reducers";
import Loading from "../Loading";
const RejectedEmployee = () => {
     const { error, loading, rejecteddata } = useSelector(
         (state) => state.employee
     );
     console.log("Employee data", rejecteddata);
    const dispatch=useDispatch();
        const getRejectedEmployees = () => {
            dispatch(getRejectedUser(localStorage.getItem('company_code')));
        }
    useEffect(()=>{
        getRejectedEmployees();
    },[])
    // const data = [
    //     {
    //         name: "Test",
    //         email: "test",
    //         employee: { company_code: "12345" },
    //     },
    // ];
       if (loading) return <Loading/>;

       // Show error state
       if (error)
           return <Alert message="Error" description={error} type="error" />;

    return (
        <>
        <h1>Rejected Employees</h1>
        <Table
            columns={columns} // Pass the columns here
            dataSource={rejecteddata} // Pass the employee data here
            // rowKey={(record) => record.employee.company_code}
            pagination={false}
        />
        </>
    );
};
export const columns = [
    {
        title: "Name",
        dataIndex: ["user","name"],
        key: "companyName",
    },
    {
        title: "Email",
        dataIndex: ["user","email"],
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
    //             <Button
                   
    //                 style={{
    //                     border: "none",
    //                     background: "green",
    //                     color: "white",
    //                 }}
    //                 // onClick={() => onView(record.id)}
    //                 icon={<TiTick />}
    //             />
    //             {/* <Button icon={<MdDelete />} /> */}
    //         </div>
    //     ),
    // },
];

export default RejectedEmployee;
