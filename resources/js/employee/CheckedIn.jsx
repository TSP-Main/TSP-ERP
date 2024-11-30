import { notification, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { allEmployee, checkedinEmployee } from "./redux/reducers";

const CheckedIn = () => {
    const dispatch = useDispatch();
    const [employees, setEmployees] = useState([]); // State for all employees
    const [checkedInIds, setCheckedInIds] = useState([]); // State for checked-in employees' IDs

    const columns = [
        {
            title: "Name",
            dataIndex: ["user","name"],
            key: "name",
        },
        {
            title: "Email",
            dataIndex: ["user","email"],
            key: "email",
        }
    ];

    // Fetch all employees
    const fetchAllEmployees = async () => {
        try {
            const code = localStorage.getItem("company_code");
            const payload = {
                role: "employee",
                code: code,
            };
            const response = await dispatch(allEmployee(payload)).unwrap();
            console.log("response", response);
            setEmployees(response || []);
        } catch (error) {
            notification.error({
                message: "Error",
                description: "Error fetching employees",
            });
        }
    };

    // Fetch checked-in employees
    const fetchCheckedInEmployees = async () => {
        try {
            const id = localStorage.getItem("company_id");
            const payload = {
                company_id: id,
            };
            if (id) {
                const response = await dispatch(
                    checkedinEmployee(payload)
                ).unwrap();
                console.log("response", response);
                const checkedInEmployeeIds =
                    response?.map((emp) => emp.employee_id) || [];
                setCheckedInIds(checkedInEmployeeIds);
                console.log("checkedInEmployeeIds", checkedInEmployeeIds || []);
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: "Error fetching checked-in employees",
            });
        }
    };

    // Fetch both employee lists on component mount
    useEffect(() => {
        fetchAllEmployees();
        fetchCheckedInEmployees();
    }, []);

    // Set row class for checked-in employees
    const rowClassName = (record) => {
        return checkedInIds.includes(record.user.id) ? "checked-in-row" : "";
    };
    

    return (
        <>
            <h1>Checked-In Employees</h1>
            <Table
                columns={columns}
                dataSource={employees}
                rowKey={(record) => record.id}
                rowClassName={rowClassName}
                pagination={true}
            />
            <style jsx>{`
                .checked-in-row {
                    background-color: #a8cd89 !important; /* Light green background */
                }
            `}</style>
        </>
    );
};

export default CheckedIn;
