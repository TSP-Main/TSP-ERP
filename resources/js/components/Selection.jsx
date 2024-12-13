import { Button } from "antd";
import React, { useState } from "react";

const Selection = ({onSelect}) => {
    // State to track which button is selected
    const [selected, setSelected] = useState("Employee");

    const handleClick = (value) => {
        setSelected(value);
        onSelect(value)
    };

    return (
        <div
            style={{
                display: "flex",
                maxWidth: "21%",
                justifyContent: "space-between",
                marginBottom: "16px",
                padding: "4px",
                borderRadius: "5px",
                height: "40px",
            }}
        >
            <Button
                onClick={() => handleClick("Manager")}
                style={{
                    backgroundColor:
                        selected === "Manager" ? "#333333" : "transparent", // Highlight selected button
                    color: selected === "Manager" ? "#fff" : "#000", // White text for selected
                    borderRadius: "20px",
                    fontWeight: "bold",
                    border:"none",
                }}
            >
                Manager
            </Button>
            <Button
                onClick={() => handleClick("Employee")}
                style={{
                    backgroundColor:
                        selected === "Employee" ? "#333333" : "transparent", // Highlight selected button
                    color: selected === "Employee" ? "#fff" : "#000", // White text for selected
                    border: "none",
                    borderRadius: "20px",
                    fontWeight: "bold",
                }}
            >
                Employee
            </Button>
        </div>
    );
};

export default Selection;
