import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import { getChangeRequest } from "./redux/reducer"; // Import your async thunk
import { allEmployee } from "../employee/redux/reducers";
import { allEmployeeM } from "../manager/redux/reducer";
// allEmployee
const ChangeShift = () => {
    const dispatch = useDispatch();
    const { changeRequestData,loading } = useSelector((state) => state.schedule);
    console.log("data", changeRequestData);
    const [data,setData]=useState([])
    
   const showData = async () => {
       const code = localStorage.getItem("company_code");
       const role = localStorage.getItem("role");
       const id = localStorage.getItem("manager_id");

       if (role === "company") {
           // Fetch data for "company" role
           dispatch(getChangeRequest(code));
       } else {
           try {
               // Fetch shift change requests
               const response_shift = await dispatch(getChangeRequest({code,id}));
               const filteredData = response_shift.payload;
               
               // Fetch employees managed by the manag

               // Update state with filtered data
               setData(filteredData);
           } catch (error) {
               console.error("Error fetching data:", error);
           }
       }
   };

    useEffect(() => {
        showData();
        // Dispatch the action to fetch data when the component mounts
        
    }, [dispatch]);

    // Define the table columns
    const columns = [
        {
            title: "Employee Name",
            dataIndex: "employee_name",
            key: "employee_name",
        },
        {
            title: "Employee Email",
            dataIndex: "employee_email",
            key: "employee_email",
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
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
    ];

    // Data mapping from the API response
const dataa = data?.map((item) => ({
    key: item.employee_id, // Unique key for each record
    employee_name: item.employee_name,
    employee_email: item.employee_email,
    date: item.date,
    start_time: item.start_time,
    end_time: item.end_time,
}));
  const role=localStorage.getItem('role')
    return (
        <div>
            <h1>Change Shift</h1>
            <Table
                columns={columns}
                dataSource={role === "company" ? changeRequestData : data}
                loading={loading} // Show loading state while fetching data
                pagination={false} // Disable pagination, or configure as needed
            />
        </div>
    );
};

export default ChangeShift;
