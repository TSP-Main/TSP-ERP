import React, { useEffect,useState,useMemo } from "react";
import { Table, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { gettCancelledInvitedEmployees } from "./redux/reducer";
import FilterComponent from "../components/FilterComponent";

const InvitedCanceledEmployee = () => {
    const dispatch = useDispatch();
    const { cancelinvitedemployeedata } = useSelector((state) => state.manager);
     const [filterText, setFilterText] = useState("");
    console.log("cancelinvitedemployeedata", cancelinvitedemployeedata);
    useEffect(() => {
        fetchInvitedCanceledEmployee();
    }, []);
 const handleFilterChange = (value) => {
     setFilterText(value);
 };
 const filteredItems = useMemo(() => {
     if (cancelinvitedemployeedata == null) return [];
     return cancelinvitedemployeedata.filter((item) =>
         JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase())
     );
 }, [cancelinvitedemployeedata, filterText]);
    const fetchInvitedCanceledEmployee = async () => {
        try {
            const payload={
                code: localStorage.getItem("company_code"),
               id: localStorage.getItem("manager_id"),
            }
            await dispatch(
                gettCancelledInvitedEmployees(payload)
            );
        } catch (error) {
            notification.error({
                message: "Error",
                description: error || "Failed to fetch invited managers.",
                duration: 2,
            });
        }
    };

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
    ];

    return (
        <>
        <h1>Invite Canceled Employees</h1>
            <FilterComponent style=
            {{
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
                style={{ marginTop: "16px" }}
                dataSource={filteredItems}
                columns={columns}
                pagination={false}
            />
        </>
    );
};

export default InvitedCanceledEmployee
