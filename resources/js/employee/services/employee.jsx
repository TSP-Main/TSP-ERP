import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { allEmployee } from "../redux/reducers";
import { Table, Spin, Alert, Select } from "antd"; // Import necessary components from Ant Design

function Employee() {
    const { error, loading, employeedata } = useSelector(
        (state) => state.employee
    );
    const [selectedRole, setSelectedRole] = useState("employee");

    console.log(employeedata);

    // Fetch employees if they are not loaded already
    const dispatch = useDispatch();
    useEffect(() => {
        try {
            const code = localStorage.getItem("company_code");
            const payload = {
                role: selectedRole,
                code: code,
            };
            const response = dispatch(allEmployee(payload));
        } catch (error) {

        }
    }, [dispatch,selectedRole]);

    // Show loading state
    if (loading) return <Spin size="large" tip="Loading..." />;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    // Render the Table with data
    return (
        <>
            <Select
                value={selectedRole}
                placeholder={`Filter by: ${selectedRole}`}
                style={{
                    marginBottom: "10px",
                    width: "15%",
                }}
                onChange={(value) => setSelectedRole(value)}
            >
                <Select.Option
                    value="employee"
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    Employee
                </Select.Option>
                <Select.Option
                    value="manager"
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    Manager
                </Select.Option>
            </Select>
            <Table
                columns={columns} // Pass the columns here
                dataSource={employeedata} // Pass the employee data here
                // rowKey={(record) => record.employee.company_code}
                pagination={false}
            />
        </>
    );
}

export const columns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "companyName",
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "companyEmail",
    },
    {
        title: "Company Code",
        dataIndex: ["employee", "company_code"],
        key: "companyCode",
    },
];

export default Employee;
