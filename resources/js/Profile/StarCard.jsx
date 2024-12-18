import React from "react";
import "./profile.css";

const StatCard = ({ text, icon, total }) => {
    return (
        <div className="stat-card">
            <img className="stat-icon" src={icon} alt="icon" />
            <div className="stat-details">
                <p className="stat-text">{text}</p>
                <p className="stat-total">{total}</p>
            </div>
        </div>
    );
};

export default StatCard;
