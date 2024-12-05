import React, { useEffect } from 'react'
import book from './company.png'
import money from './money.png'
import totalemployees from './totalemployess.png'
import present from './present.png'
import absent from './absent.png'
// import { FaCoffee } from "react-icons/fa";
import StatCard from './StarCard';
// useEffect(()=>{
//   const role=localStorage.getItem('role')
// })
const Profile = () => {
   const name=localStorage.getItem('name')
   const role=localStorage.getItem('role')
  
  return (
      <div
          style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
          }}
      >
          <div>
              <h2>Welcome Back, {name}!</h2>
              <p>Here's Your study</p>
          </div>
          {role == "super_admin" && (
              <>
                  <StatCard icon={book} total={10} text="Total Companies" />
                  <StatCard icon={money} total={10} text="Total Revenue" />
              </>
          )}
          {role == "company" && (
              <>
                  <StatCard
                      icon={totalemployees}
                      total={10}
                      text="Total Employees"
                  />
                  <StatCard icon={present} total={10} text="Checked In" />
                  <StatCard icon={absent} total={10} text="Absent" />
              </>
          )}
          {role == "manager" && (
              <>
                  <StatCard
                      icon={totalemployees}
                      total={10}
                      text="Total Employees"
                  />
                  <StatCard icon={present} total={10} text="Checked In" />
                  <StatCard icon={absent} total={10} text="Absent" />
              </>
          )}
          {role == "employee" && (
              <>
                  <StatCard
                      icon={totalemployees}
                      total={10}
                      text="Total Shifts"
                  />
                  <StatCard icon={present} total={10} text="Attended" />
                  <StatCard icon={absent} total={10} text="Missed" />
              </>
          )}

          <div></div>
      </div>
  );
}

export default Profile
