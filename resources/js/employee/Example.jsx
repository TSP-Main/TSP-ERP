import React, { useEffect, useState } from "react";
import { Table, Select, Button, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowRight } from "react-icons/fa";
import { allEmployee } from "../employee/redux/reducers";
import { showSchedule, getAssignedSchedules } from "../shift/redux/reducer";
import { assignSchedule } from "../attendance/redux/reducer";

const EmployeeScheduleTable = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShiftsState, setSelectedShiftsState] = useState({});

    const dispatch = useDispatch();

    const { employeedata, loading: employeeLoading } = useSelector(
        (state) => state.employee
    );
    const { scheduledata, loading: scheduleLoading } = useSelector(
        (state) => state.schedule
    );
    const { assignedSchedules } = useSelector((state) => state.schedule);

    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                day: date.toLocaleString("en-US", { weekday: "short" }), // e.g., Mon
                formattedDate: date.toLocaleDateString("en-US", {
                    day: "numeric", // e.g., 2
                    month: "short", // e.g., Dec
                }),
            });
        }
        return dates;
    };


    const reorderedDays = generateDates();

    const handleShiftChange = (employeeKey, column, shiftId) => {
        setSelectedShiftsState((prevShifts) => ({
            ...prevShifts,
            [employeeKey]: {
                ...prevShifts[employeeKey],
                [column]: shiftId,
            },
        }));
    };

    const handleAssignShiftToAllDays = (employeeId, currentShifts) => {
        const firstNonNullShift = Object.values(currentShifts).find(
            (shift) => shift !== null
        );
        if (firstNonNullShift) {
            setSelectedShiftsState((prevState) => ({
                ...prevState,
                [employeeId]: reorderedDays.reduce((acc, _, index) => {
                    acc[`col${index + 1}`] = firstNonNullShift;
                    return acc;
                }, {}),
            }));
        }
    };

    const handleSubmit = () => {
        const payload = [];
        Object.entries(selectedShiftsState).forEach(([employeeId, shifts]) => {
            Object.entries(shifts).forEach(([col, scheduleId]) => {
                if (scheduleId) {
                    payload.push({
                        employee_id: parseInt(employeeId),
                        schedule_id: scheduleId,
                    });
                }
            });
        });
        dispatch(assignSchedule(payload));
    };

    useEffect(() => {
        const code = localStorage.getItem("company_code");
        if (code) dispatch(allEmployee({ role: "employee", code }));

        const companyId = localStorage.getItem("company_id");
        if (companyId) {
            dispatch(showSchedule(companyId));
            dispatch(getAssignedSchedules(companyId));
        }
    }, [dispatch]);

    useEffect(() => {
        if (employeedata?.length) {
            const formattedData = employeedata.map((employee) => ({
                key: employee.id,
                name: employee?.user?.name,
                ...reorderedDays.reduce((acc, _, index) => {
                    acc[`col${index + 1}`] = null;
                    return acc;
                }, {}),
            }));
            setDataSource(formattedData);
            setLoading(false);
        }
    }, [employeedata]);

    const columns = [
        {
            title: "Employee",
            dataIndex: "name",
            key: "employee",
            // fixed: "left",
            render: (text, record) => (
                <
                    // style={{ display: "flex", justifyContent: "space-between" }}
                >
                    {text}
                    <FaArrowRight
                        onClick={() =>
                            handleAssignShiftToAllDays(
                                record.key,
                                selectedShiftsState[record.key] || {}
                            )
                        }
                        style={{ cursor: "pointer", color: "#1890ff" }}
                    />
                </>
            ),
        },
        ...reorderedDays.map((day, dayIndex) => ({
            title: (
                <div style={{ textAlign: "center" }}>
                    <div>{day.day}</div>
                    <div>{day.formattedDate}</div>
                </div>
            ),
            dataIndex: `col${dayIndex + 1}`,
            key: `col-${day.day}-${dayIndex}`,
            render:(text,record)=>{
                return (
                    <Select
                        style={{
                            width: "60px", // Default compact width
                        }}
                        dropdownStyle={{
                            width: "auto", // Allow dropdown to expand
                            minWidth: "150px", // Set minimum width for the dropdown
                        }}
                        placeholder="Assign"
                    >
                        <Select.Option value={null}>No Schedule</Select.Option>
                        <Select.Option value={1}>Schedule 1</Select.Option>
                    </Select>
                );
            }
            // render: (text, record) => {
            //     const shiftId =
            //         selectedShiftsState[record.key]?.[`col${dayIndex + 1}`];
            //     return (
            //         <Select
            //             placeholder="Assign Shift"
            //             value={shiftId || null}
            //             onChange={(value) =>
            //                 handleShiftChange(
            //                     record.key,
            //                     `col${dayIndex + 1}`,
            //                     value
            //                 )
            //             }
            //             // style={{ width: "100%" }}
            //         >
            //             <Select.Option value={null}>No Schedule</Select.Option>
            //             {scheduledata.map((schedule) => (
            //                 <Select.Option
            //                     key={schedule.schedule_id}
            //                     value={schedule.schedule_id}
            //                 >
            //                     {`${schedule.start_time} - ${schedule.end_time}`}
            //                 </Select.Option>
            //             ))}
            //         </Select>
            //     );
            // },
        })),
    ];

    if (employeeLoading || scheduleLoading)
        return <Spin size="large" tip="Loading..." />;

    return (
        <>
            <Table
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                bordered
                pagination={false}
                // scroll={{ x: "max-content" }}
            />
            {/* <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                }}
            >
                <Button type="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </div> */}
        </>
    );
};

export default EmployeeScheduleTable;
