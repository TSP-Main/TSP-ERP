import React from "react";
// import book from "./book.png"; // Adjust the path based on your file structure
import './profile.css'
const StatCard = ({text,icon,total}) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "16px", // Adds spacing between icon and text
            }}
        >
            {/* Book Icon */}
            <img
                className="book-icon"
                src={icon}
                alt="Book Icon"
                // style={{
                //     width: "50px",
                //     height: "50px",
                // }}
            />

            <div className="star-card" >
                <p
                    className="card-text"
                    // style={{ margin: 0, fontSize: "14px", color: "#7E7E7E" }}
                >
                    {text}
                </p>
                <p
                    className="card-total"
                    // style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}
                >
                    {total}
                </p>
            </div>
        </div>
    );
};

export default StatCard;
