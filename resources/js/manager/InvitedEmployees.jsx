import { notification, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { allEmployeeM, getInvitedUsers, inActiveEmployeeM } from "./redux/reducer";
import { useSelector } from "react-redux";

const index = () => {
    const dispatch = useDispatch();
    const [inviteddata,setInvitedData]=useState([])
    // const { activeEmployeedata } = useSelector((state) => state.manager);
    const fetchEmployees = async () => {
        // code=localStorage.getItem('company_code')

        const payload = {
            code: "CPM-67175A6A1BGKT",
            id: localStorage.getItem("manager_id"),
        };
        console.log("jnsjddddd payload", payload);
        try {
            const response = await dispatch(getInvitedUsers(payload));
             console.log("invited data", response.payload);
            setInvitedData(response.payload)
           
        } catch (error) {
            notification.error({
                message: error.response?.errors || "Failed to fetch data",
            });
        }
    };
    useEffect(() => {
        fetchEmployees();
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
            <h1>Invited Employees</h1>
            <Table columns={columns} dataSource={inviteddata} />
        </>
    );
};

export default index;
