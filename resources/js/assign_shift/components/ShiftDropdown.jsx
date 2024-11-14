import React from "react";
import { Select } from "antd";

const ShiftDropdown = ({ scheduledata, onShiftSelect }) => {
    if (!scheduledata || scheduledata.length === 0) {
        return <div>No shifts available</div>;
    }
    console.log(onShiftSelect)
    
    return (
        <div>
            <Select
                placeholder="Select shift"
                style={{ width: "100%" }}
                onChange={onShiftSelect} // Call the passed function with selected shift ID

            >
                {scheduledata.map((data) => (
                    <Select.Option key={data.id} value={data.id}>
                        {`${data.start_time}-${data.end_time}`}
                    </Select.Option>
                ))}
            </Select>
        </div>
    );
};

export default ShiftDropdown;
