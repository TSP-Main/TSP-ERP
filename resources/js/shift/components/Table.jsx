import React, { useEffect } from 'react'
import { Table } from 'antd';
import { useDispatch } from 'react-redux';
import { showSchedule } from '../redux/reducer';
import { useSelector } from 'react-redux';
const Tablee = () => {
   const dispatch=useDispatch()
   const {error,loading,scheduledata}=useSelector((state)=>state.schedule)
    useEffect(() => {
       const id = sessionStorage.getItem("company_id");
           dispatch(showSchedule(id));
       },[]);
  return (
      <Table
          columns={columns} // Pass the columns here
         dataSource={scheduledata} // Pass the employee data here
        //   rowKey={(record) => record.employee.company_code}
          pagination={false}
      />
  );


}

export const columns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
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
    {
        title:'Total Hours',
        dataIndex:'total_hours',
        key:'total_hours'
    },
    {
        title:'Week Day',
        dataIndex:'week_day',
        key:'week_day'
    }
];


export default Tablee
