import React, { useEffect, useState,useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Spin, Alert, Button, notification } from "antd";
import { inactiveUsersData, approveUserAction } from "./redux/reducer";
import Loading from "../Loading";
import FilterComponent from "../components/FilterComponent";

const InActive = () => {
  
    const dispatch = useDispatch();
    const [loadingMap, setLoadingMap] = useState({}); // To track loading for each row
    const { error, loading, inactivedata } = useSelector(
        (state) => state.company
    );
         const [filterText, setFilterText] = useState("");
        const handleFilterChange = (value) => {
            setFilterText(value);
        };
const filteredItemsM = useMemo(() => {
    if (inactivedata == null) return [];
    return inactivedata.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase())
    );
}, [inactivedata, filterText]);
    const handleApprove = async (id) => {
        setLoadingMap((prev) => ({ ...prev, [id]: true })); // Set loading for this row
        try {
            console.log("inside try");
            const response = await dispatch(approveUserAction(id));
            console.log("response", response);
            if (response.error) {
                notification.error({
                    description: response.payload || "Failed to approve user.",
                    duration: 3,
                });
            } else {
                notification.success({
                    description: "User approved successfully.",
                    duration: 3,
                });
            }
        } catch (error) {
            console.log("error in catch block", error);
            notification.error({
                message: "Error",
                description: error.message || "An unexpected error occurred.",
                duration: 3,
            });
        } finally {
            setLoadingMap((prev) => ({ ...prev, [id]: false })); // Reset loading for this row
            // Optionally refresh inactive users data
            dispatch(inactiveUsersData());
        }
    };

    useEffect(() => {
        console.log("useEffect inactive");
        dispatch(inactiveUsersData());
        console.log("errors", error);
        if (error) {
            notification.error({
                message: "Error",
                description: error || "Login failed",
                duration: 3,
            });
            return;
        }
    }, [dispatch, error]);

    console.log("inactiveUsersData", inactivedata);

    // Define table columns
    const columns = [
        {
            title: "Name",
            dataIndex: ["company", "name"], // Access nested 'name' in 'company'
            key: "companyName",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.company?.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.company?.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
        {
            title: "Email",
            dataIndex: "email", // Access 'email' directly from main object
            key: "companyEmail",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.name?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.name?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },

        {
            title: "Code",
            dataIndex: ["company", "code"], // Access nested 'code' in 'company'
            key: "companyCode",
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <Button
                    type="primary"
                    loading={loadingMap[record?.id]} // Only show loading for this button
                    onClick={() => handleApprove(record?.id)}
                >
                    Approve
                </Button>
            ),
        },
    ];

    if (loading) {
        return <Loading />;
    }

    if (error)
        return (
            <Alert message="Error" description={error} type="error" showIcon />
        );

    return (
        <div>
            <h1>New SignUps</h1>
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
                style={{marginTop: "16px"}}
                size="small"
                columns={columns}
                dataSource={filteredItemsM}
                rowKey={(record) => record.user_id} // Use 'user_id' as unique key
                pagination={true}
            />
        </div>
    );
};

export default InActive;
