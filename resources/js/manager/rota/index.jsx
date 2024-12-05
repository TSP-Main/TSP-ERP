import { Table } from 'antd'
import React from 'react'

const index = () => {
    const columns=[
        {
            title:"Name",
            key:"name"
        },
        {
          ttile:'Email',
          key:'email'
        }
    ]
  return (
      <>
          <h1>Employees</h1>
          <Table columns={columns} />
      </>
  );
}

export default index
