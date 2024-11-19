import React from "react";
import { Select } from "antd";

const ShiftDropdown = ({ scheduledata, onShiftSelect, selectedShiftId }) => {
    // Check if scheduledata is a valid array
    if (!Array.isArray(scheduledata) || scheduledata.length === 0) {
        return <div>No shifts available</div>;
    }

    return (
        <div>
            <Select
                placeholder="Select shift"
                style={{ width: "100%" }}
                value={selectedShiftId}
                onChange={onShiftSelect}
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