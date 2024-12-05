import { notification, Table } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { allEmployeeM } from "./redux/reducer";
import { useSelector } from "react-redux";

const index = () => {
    const dispatch=useDispatch()
    const {activeEmployeedata}=useSelector((state)=>state.manager)
    const fetchEmployees=async()=>{
        // code=localStorage.getItem('company_code')

        const payload = {
            code:"CPM-67175A6A1BGKT",
            id: localStorage.getItem("manager_id"),
        };
        console.log("jnsjddddd payload",payload)
        try{
            const response=await dispatch(allEmployeeM(payload))

        }catch(error){
            notification.error({
                message: error.response?.errors || "Failed to fetch data",
            });
        }
    }
    useEffect(()=>{
        fetchEmployees();
    },[])
    const columns = [
        {
            title: "Name",
            dataIndex: ["user", "name"],
            key: "name",
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
        },
        {
            title: "Manager",
            dataIndex: ["manager", "user", "name"],
            key: "manager",
        },
    ];
    return (
        <>
            <h1>Active Employees</h1>
            <Table columns={columns} dataSource={activeEmployeedata} />
        </>
    );
};

export default index;
