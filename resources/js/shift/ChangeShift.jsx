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
        console.log("code in try", code);
           // Fetch data for "company" role
           dispatch(getChangeRequest({code}));

       } else {
           try {
               // Fetch shift change requests
               console.log("code in try", code);
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
            dataIndex: "name",
            key: "name",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Employee Email",
            dataIndex: "email",
            key: "employee_email",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.email?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.email?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
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
                pagination={true} // Disable pagination, or configure as needed
            />
        </div>
    );
};

export default ChangeShift;
