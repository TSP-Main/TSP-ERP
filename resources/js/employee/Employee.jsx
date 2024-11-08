import React from 'react'
import Button from '../components/Button';
import { columns } from './services/employee';
import { Table } from 'antd';
import { IoMdNotificationsOutline } from "react-icons/io";
const Employee = () => {
 const handleAddEmployee = () => {
      
  };
  return (
      <>
          <h1>Employee</h1>
          <Button
              text="Send Invite"
              onClick={handleAddEmployee}
              style={{ backgroundColor: "Black", color: "white" }}
          />
          <Table
              columns={columns}
              // dataSource={onboarddata}
              // rowKey={(record) => record.company.code} // Use 'company.code' as unique key
              pagination={{ pageSize: 10 }}
          />
      </>
  );
}

export default Employee
