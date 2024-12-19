import React from "react";
import StarCard from "./StarCard";
import book from "./company.png";
import money from "./money.png";
import totalEmployees from "./totalemployess.png";
import present from "./present.png";
import absent from "./absent.png";
import "./profile.css";

const Profile = () => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    const renderStats = () => {
        switch (role) {
            case "super_admin":
                return [
                    { icon: book, total: 10, text: "Total Companies" },
                    { icon: money, total: 10, text: "Total Revenue" },
                ];
            case "company":
            case "manager":
                return [
                    {
                        icon: totalEmployees,
                        total: 10,
                        text: "Total Employees",
                    },
                    { icon: present, total: 10, text: "Checked In" },
                    { icon: absent, total: 10, text: "Absent" },
                ];
            case "employee":
                return [
                    { icon: totalEmployees, total: 10, text: "Total Shifts" },
                    { icon: present, total: 10, text: "Attended" },
                    { icon: absent, total: 10, text: "Missed" },
                ];
            default:
                return [];
        }
    };

    return (
        <div className="profile-dash">
            <div className="welcome-section">
                <h2 style={{ fontWeight:"normal"}}>Welcome Back</h2>
                <h2>{name}!</h2>
            </div>

            <div className="stat-card-container">
                {renderStats().map((stat, index) => (
                    <StarCard
                        key={index}
                        icon={stat.icon}
                        total={stat.total}
                        text={stat.text}
                    />
                ))}
            </div>
        </div>
    );
};

export default Profile;
