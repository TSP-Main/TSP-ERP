import React, { useEffect } from "react";
import book from "./company.png";
import money from "./money.png";
import totalemployees from "./totalemployess.png";
import present from "./present.png";
import absent from "./absent.png";
import "./profile.css";
// import { FaCoffee } from "react-icons/fa";
import StatCard from "./StarCard";
// useEffect(()=>{
//   const role=localStorage.getItem('role')
// })
const Profile = () => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    return (
        <div
            className="profile-dash"
            //   style={{
            //       display: "flex",
            //       flexDirection: "row",
            //       justifyContent: "space-between",
            //       alignItems: "center",
            //   }}
        >
            <div
                style={{
                    lineHeight: "1px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                    // paddingRight: "30px",
                }}
            >
                <h2>Welcome Back </h2>
                <h3>{name}!</h3>
            </div>
            {role == "super_admin" && (
                <div className="starr-card">
                    <StatCard icon={book} total={10} text="Total Companies" />
                    <StatCard icon={money} total={10} text="Total Revenue" />
                </div>
            )}
            {role == "company" && (
                <div className="starr-card">
                    <StatCard
                        icon={totalemployees}
                        total={10}
                        text="Total Employees"
                    />
                    <StatCard icon={present} total={10} text="Checked In" />
                    <StatCard icon={absent} total={10} text="Absent" />
                </div>
            )}
            {role == "manager" && (
                <div className="starr-card">
                    <StatCard
                        icon={totalemployees}
                        total={10}
                        text="Total Employees"
                    />
                    <StatCard icon={present} total={10} text="Checked In" />
                    <StatCard icon={absent} total={10} text="Absent" />
                </div>
            )}
            {role == "employee" && (
                <div className="starr-card">
                    <StatCard
                        icon={totalemployees}
                        total={10}
                        text="Total Shifts"
                    />
                    <StatCard icon={present} total={10} text="Attended" />
                    <StatCard icon={absent} total={10} text="Missed" />
                </div>
            )}

            <div></div>
        </div>
    );
};

export default Profile;
