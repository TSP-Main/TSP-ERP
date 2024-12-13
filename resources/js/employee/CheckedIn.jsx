import { notification, Table } from "antd";
import React, { useEffect, useState,useMemo } from "react";
import { useDispatch } from "react-redux";
import { allEmployee, checkedinEmployee } from "./redux/reducers";
import { useSelector } from "react-redux";
import FilterComponent from "../components/FilterComponent";

const CheckedIn = () => {
     const [filterText, setFilterText] = useState("");
    const dispatch = useDispatch();
    const [employees, setEmployees] = useState([]); // State for all employees
    const [checkedInIds, setCheckedInIds] = useState([]); // State for checked-in employees' IDs\
     const [checkinDataMap, setCheckinDataMap] = useState({});
    const {checkinData}=useSelector((state)=>state.employee)
    console.log("CheckedIn",checkinData);
    const handleFilterChange = (value) => {
        setFilterText(value);
    };
       const filteredItemsM = useMemo(() => {
            return employees.filter((item) =>
                JSON.stringify(item)
                    .toLowerCase()
                    .includes(filterText.toLowerCase())
            );
        }, [employees, filterText]);
    const columns = [
        {
            title: "Name",
            dataIndex: ["user", "name"],
            key: "name",
             defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
             defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Time In",
            key: "timeIn",
            render: (text, record) =>
                checkedInIds.includes(record.id)
                    ? checkinDataMap[record.id]?.time_in || "-"
                    : "-", // Show Time In if the employee is checked in
        },
    ];

    // Fetch all employees
    const fetchAllEmployees = async () => {

        try {
            const role=localStorage.getItem("role");
             const code = localStorage.getItem("company_code");

            if(role==="company"){
               

                const response = await dispatch(allEmployee({ code })).unwrap();
                console.log("response", response);
                setEmployees(response || []);
            }
            else{
                const id=localStorage.getItem("manager_id");
                const response = await dispatch(allEmployee({ code,id })).unwrap();
                console.log("response", response);
                setEmployees(response || []);
            }
            
        } catch (error) {
            notification.error({
                message: "Error",
                description: "Error fetching employees",
            });
        }
    };

    // Fetch checked-in employees
const fetchCheckedInEmployees = async () => {
    const id = localStorage.getItem("company_id");

    try {
        const role = localStorage.getItem("role");
        let response = []; // Initialize response variable

        if (role === "company") {
            response = await dispatch(checkedinEmployee({ id })).unwrap();
        } else if (role === "manager") {
            const manager_id = localStorage.getItem("manager_id");
            response = await dispatch(
                checkedinEmployee({ id, manager_id })
            ).unwrap();
        }

        console.log("API response:", response);
        const checkinMap = response?.reduce((map, emp) => {
            map[emp.employee_id] = {
                time_in: emp.time_in,
            };
            return map;
        }, {});

        setCheckinDataMap(checkinMap);

        // Check if response is valid before mapping
        const checkedInEmployeeIds =
            response?.map((emp) => emp.employee_id) || [];

        setCheckedInIds(checkedInEmployeeIds);

        console.log("checkedInEmployeeIds", checkedInEmployeeIds);
    } catch (error) {
        console.error("Error fetching checked-in employees", error);
        notification.error({
            message: "Error",
            description: "Error fetching checked-in employees",
        });
    }
};


    // Fetch both employee lists on component mount
    useEffect(() => {
        fetchAllEmployees();
        fetchCheckedInEmployees();
    }, []);

    // Set row class for checked-in employees
    const rowClassName = (record) => {
        return checkedInIds.includes(record.id) ? "checked-in-row" : "";
    };
    

    return (
        <>
            <h1>Checked-In Employees</h1>
            <FilterComponent
                style={{
                    // marginBottom: "16px",
                    display: "flex",
                    flexDirection: "row-reverse",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}
                filterText={filterText}
                onFilter={handleFilterChange}
                // onClear={handleClearFilter}
            />
            <Table
            style={{marginTop:"20px"}}
                columns={columns}
                dataSource={filteredItemsM}
                rowKey={(record) => record.id}
                rowClassName={rowClassName}
                pagination={true}
            />
            <style jsx>{`
                .checked-in-row {
                    background-color: #a8cd89 !important; /* Light green background */
                }
            `}</style>
        </>
    );
};

export default CheckedIn;
