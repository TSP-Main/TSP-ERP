import React from "react";
import styled from "styled-components";
import { CiSearch } from "react-icons/ci";
import { Input } from "antd";
// const Input = styled.input.attrs(() => ({
//     type: "text",
// }))`
//     height: 32px;
//     width: 200px;
//     border-radius: 3px;
//     border: 1px solid #e5e5e5;
//     padding: 0 32px 0 16px;
//     margin-right: 8px;
// `;

const ClearButton = styled.button`
    height: 34px;
    width: 32px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid #e5e5e5;
    background-color: #fff;
    border-radius: 3px;
`;

const FilterComponent = ({ filterText, onFilter }) => (
    <div
        style={{
            display: "flex",
            // alignItems: "center",
            justifyContent: "flex-end",
            borderRadius: "20px",
        }}
    >
        <Input
            prefix={<CiSearch />}
            style={{
                borderRadius: "20px",
                height: "fit-content",
                width: "auto",
                // marginBottom: "20px",
            }}
            placeholder="Search..."
            value={filterText}
            onChange={(e) => onFilter(e.target.value)} // Update filterText state
        />
        {/* <ClearButton onClick={onClear}>X</ClearButton> */}
    </div>
);

export default FilterComponent;
