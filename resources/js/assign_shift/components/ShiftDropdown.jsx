import React from "react";
import { Select } from "antd";

const ShiftDropdown = ({ scheduledata, onShiftSelect, selectedShiftId }) => {
    if (!scheduledata || scheduledata.length === 0) {
        return <div>No shifts available</div>;
    }

    return (
        <div>
            <Select
                placeholder="Select shift"
                style={{ width: "100%" }}
                value={selectedShiftId} // Use selectedShiftId to control the selected value
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