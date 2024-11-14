import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { allEmployee } from "../redux/reducers";
import { Table, Spin, Alert } from "antd"; // Import necessary components from Ant Design

function Employee() {
    const { error, loading, employeedata } = useSelector(
        (state) => state.employee

    );

    console.log(employeedata)


    // Fetch employees if they are not loaded already
    const dispatch = useDispatch();
    useEffect(() => {
         const code=sessionStorage.getItem('company_code');
         const response=dispatch(allEmployee(code)); // Assuming allEmployee fetches employee data

    }, []);

    // Show loading state
    if (loading) return <Spin size="large" tip="Loading..." />;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    // Render the Table with data
    return (
        <Table
            columns={columns} // Pass the columns here
            dataSource={employeedata} // Pass the employee data here
            rowKey={(record) => record.employee.company_code}
            pagination={false}
        />
    );
}

export const columns = [
    {
        title: "Name",
        dataIndex:"name",
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
