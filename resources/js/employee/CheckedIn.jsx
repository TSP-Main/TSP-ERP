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
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
        },
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
            setEmployees(response.data || []);
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
                const checkedInEmployeeIds =
                    response.data?.data.map((emp) => emp.id) || [];
                setCheckedInIds(checkedInEmployeeIds);
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
        return checkedInIds.includes(record.id) ? "checked-in-row" : "";
    };

    return (
        <>
            <h1>Checked-In Employees</h1>
            <Table
                columns={columns}
                dataSource={employees}
                rowKey={(record) => record.id}
                rowClassName={rowClassName}
            />
            <style jsx>{`
                .checked-in-row {
                    background-color: #d4edda !important; /* Light green background */
                }
            `}</style>
        </>
    );
};

export default CheckedIn;
