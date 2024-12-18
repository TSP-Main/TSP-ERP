import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Spin, Alert } from "antd";
import { activeUsersData, allUsers } from "./redux/reducer";
import Loading from "../Loading";
import FilterComponent from "../components/FilterComponent";

const AllUsers = () => {
    const dispatch = useDispatch();
    const { error, loading, allUser } = useSelector(
        (state) => state.company
    );
    const [filterText, setFilterText] = useState("");
    const handleFilterChange = (value) => {
        setFilterText(value);
    };
    const filteredItemsM = useMemo(() => {
        if (allUser == null) return [];
        return allUser.filter((item) =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(filterText.toLowerCase())
        );
    }, [allUser, filterText]);
    useEffect(() => {
        const fetch=()=>{
 const res = dispatch(allUsers());
 console.log("allUsers", res);
        }
        console.log("OnBoard");
      fetch()

    }, []);

    // Define table columns
    const columns = [
        {
            title: "Name",
            dataIndex: "name", // Access nested 'name' in 'company'
            key: "Name",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.company?.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Email",
            dataIndex: "email", // Access 'email' directly from main object
            key: "Email",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.email?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.email?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        }
    ];

    if (loading) return <Loading />;
    if (error)
        return (
            <Alert
                message="Error"
                description="Failed to load company data."
                type="error"
                showIcon
            />
        );

    return (
        <div>
            <h1>All Users</h1>
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
                pagination={false}
                columns={columns}
                dataSource={filteredItemsM}
                // rowKey={(record) => record.company.code} // Use 'company.code' as unique key
                // pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default AllUsers;
