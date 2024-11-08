import React from 'react';

const Button = ({ text = "Click Me", onClick, style = {} }) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 16,
            }}
        >
            <button
                style={{
                    backgroundColor: "black",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    ...style, // Allow custom styles to be merged
                }}
                onClick={onClick}
            >
                {text}
            </button>
        </div>
    );
}

export default Button;

