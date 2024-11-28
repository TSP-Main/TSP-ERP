import React from "react";
import { Table, Button } from "antd";
import { TiTick } from "react-icons/ti";
const RejectedEmployee = () => {
    const data = [
        {
            name: "Test",
            email: "test",
            employee: { company_code: "12345" },
        },
    ];
    return (
        <Table
            columns={columns} // Pass the columns here
            dataSource={data} // Pass the employee data here
            // rowKey={(record) => record.employee.company_code}
            pagination={false}
        />
    );
};
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
    {
        title: "Actions",
        key: "actions",
        render: (text, record) => (
            <div style={{ display: "flex", gap: "8px" }}>
                <Button
                   
                    style={{
                        border: "none",
                        color: "green",
                    }}
                    // onClick={() => onView(record.id)}
                    icon={<TiTick />}
                />
                {/* <Button icon={<MdDelete />} /> */}
            </div>
        ),
    },
];

export default RejectedEmployee;
