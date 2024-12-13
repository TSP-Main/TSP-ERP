import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, notification, Tooltip, Flex, Alert } from "antd";
import { MdCancelPresentation } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getInvitedUsers, cancelInvite } from "./redux/reducers";
import InvitedManagers from "../manager/InvitedManagers";
import Loading from "../Loading";
import FilterComponent from "../components/FilterComponent";
import Selection from "../components/Selection";

const InvitedEmployee = () => {
    const { error, loading, InvitedUsers } = useSelector(
        (state) => state.employee
    );
    const { invitedmanagerdata } = useSelector((state) => state.manager);
    const dispatch = useDispatch();
    const [selectedValue, setSelectedValue] = useState("Employee");
    const [filterText, setFilterText] = useState("");
    const handleSelectedValue = (value) => {
        setSelectedValue(value);
        console.log("Selected Value:", value); // You can perform other actions with the selected value
    };
    const handleFilterChange = (value) => {
        setFilterText(value);
    };
 

    useEffect(() => {
        fetchInvitedManagers();
    }, []);

    const fetchInvitedManagers = async () => {
        try {
            await dispatch(
                gettinvitedManager(localStorage.getItem("company_code"))
            );
        } catch (error) {
            notification.error({
                message: "Error",
                description: error || "Failed to fetch invited managers.",
                duration: 2,
            });
        }
    };

    // Clear the filter text
    const handleClearFilter = () => {
        setFilterText("");
    };
    const filteredItemsM = useMemo(() => {
        if (InvitedUsers == null) return [];
        return InvitedUsers.filter((item) =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(filterText.toLowerCase())
        );
    }, [InvitedUsers, filterText]);
      const filteredItems = useMemo(() => {
          if (invitedmanagerdata == null) return [];
          return invitedmanagerdata.filter((item) =>
              JSON.stringify(item)
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
          );
      }, [invitedmanagerdata, filterText]);

    // Fetch Invited Users
    const invitedEmployee = async () => {
        try {
            await dispatch(
                getInvitedUsers(localStorage.getItem("company_code"))
            );
        } catch (error) {
            notification.error({
                description: error || "Failed to get invited users.",
                duration: 1.5,
            });
        }
    };

    useEffect(() => {
        invitedEmployee();
    }, []); // Only fetch once on mount

    // Cancel Invite
    const handleCancelInvite = async (id) => {
        try {
            const response = await dispatch(cancelInvite(id));
            if (!response.error) {
                notification.success({
                    description: "Invite Cancelled Successfully",
                    duration: 1.5,
                });
                invitedEmployee(); // Refresh the list after canceling
            }
        } catch (error) {
            notification.error({
                description: error || "Failed to Cancel Invite",
                duration: 1.5,
            });
        }
    };

    // Table Columns
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
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip title="Cancel Invite" trigger="hover">
                        <Button
                            style={{
                                border: "none",
                                background: "red",
                                color: "white",
                            }}
                            onClick={() => handleCancelInvite(record?.user_id)}
                            icon={<MdCancelPresentation />}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    // Show loading state
    if (loading) return <Loading />;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    return (
        <>
            <h1>Invited Staff</h1>
            <Flex style={{ justifyContent: "space-between" }}>
                <Selection onSelect={handleSelectedValue} />
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
                    onClear={handleClearFilter}
                />
            </Flex>
            <hr />
            {selectedValue === "Manager" && (
                <Table
                    dataSource={filteredItems}
                    columns={columns}
                    rowKey={(record) => record?.user?.id || record?.user_id} // Ensure unique key
                    pagination={false}
                />
            )}
            {/* Show Invited Managers */}
            {selectedValue === "Employee" && (
                <Table
                    columns={columns} // Pass the columns here
                    dataSource={filteredItemsM} // Pass the employee data here
                    rowKey={(record) => record.user_id} // Ensure unique row key
                    pagination={false} // Disable pagination for now
                />
            )}
        </>
    );
};

export default InvitedEmployee;
