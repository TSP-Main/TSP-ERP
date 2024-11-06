import React from "react";

const Icon = ({ icon, width = "32px", height = "32px", style = {} }) => {
    return (
        <div
            style={{
                width,
                height,
                padding: "0px 2px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                ...style,
            }}
        >
            <img
                src={icon}
                alt="icon"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                }}
            />
        </div>
    );
};

export default Icon;
