import { notification, Table } from "antd";
import React, { useEffect,useState,useMemo } from "react";
import { useDispatch } from "react-redux";
import { allEmployeeM, inActiveEmployeeM } from "./redux/reducer";
import { useSelector } from "react-redux";
import FilterComponent from "../components/FilterComponent";

const index = () => {
    const dispatch = useDispatch();
    const { inactiveEmployeedata } = useSelector((state) => state.manager);
     const [filterText, setFilterText] = useState("");
    const fetchEmployees = async () => {
        // code=localStorage.getItem('company_code')

        const payload = {
            code: "CPM-67175A6A1BGKT",
            id: localStorage.getItem("manager_id"),
        };
        console.log("jnsjddddd payload", payload);
        try {
            const response = await dispatch(inActiveEmployeeM(payload));
        } catch (error) {
            notification.error({
                message: error.response?.errors || "Failed to fetch data",
            });
        }
    };
    const handleFilterChange = (value) => {
        setFilterText(value);
    };
      const filteredItems = useMemo(() => {
        if (inactiveEmployeedata==null) return [];
             if (inactiveEmployeedata == null) return [];
          return inactiveEmployeedata.filter((item) =>
              JSON.stringify(item)
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
          );
      }, [inactiveEmployeedata, filterText]);
    useEffect(() => {
        fetchEmployees();
    }, []);
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
            title: "Manager",
            dataIndex: ["manager", "user", "name"],
            key: "manager",
        },
    ];
    return (
        <>
            <h1>In Active Employees</h1>
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
                style={{ marginTop: "16px" }}
                columns={columns}
                dataSource={filteredItems}
            />
        </>
    );
};

export default index;
