import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, notification, Spin, Alert, Flex } from "antd";
import { MdCancelPresentation } from "react-icons/md";
import { useDispatch } from "react-redux";
import { inActiveEmployee, approveUserAction } from "./redux/reducers";
import { useSelector } from "react-redux";
import { TiTickOutline } from "react-icons/ti";
import Loading from "../Loading";
import { gettInActiveManagers } from "../manager/redux/reducer";
import FilterComponent from "../components/FilterComponent";
import Selection from "../components/Selection";
// gettActiveManagers
const InactiveEmployee = () => {
    const { error, loading, inactivedata } = useSelector(
        (state) => state.employee
    );
    const { InActiveManagersdata } = useSelector((state) => state.manager);
    console.log("inactive", inactivedata);
    console.log("manager", InActiveManagersdata);
    const dispatch = useDispatch();
    const [selectedValue, setSelectedValue] = useState("Employee");
     const [filterText, setFilterText] = useState("");

    const handleSelectedValue = (value) => {
        setSelectedValue(value);
        console.log("Selected Value:", value); // You can perform other actions with the selected value
    };
   
    // Handle filter changes
    const handleFilterChange = (value) => {
        setFilterText(value);
    };

    // Clear the filter text
      const filteredItemsM = useMemo(() => {
        return InActiveManagersdata.filter((item) =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(filterText.toLowerCase())
        );
    }, [InActiveManagersdata, filterText]);
 const filteredItems = useMemo(() => {
    if(inactivedata === null) return [];
          return inactivedata.filter((item) =>
              JSON.stringify(item)
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
          );
      }, [inactivedata, filterText]);

    // const filteredItems = useMemo(() => {
    //     return inactivedata.filter((item) =>
    //         JSON.stringify(item)
    //             .toLowerCase()
    //             .includes(filterText.toLowerCase())
    //     );
    // }, [inactivedata, filterText]);
    const handleInactive = async (id) => {
        try {
            const response = await dispatch(
                inActiveEmployee(localStorage.getItem("company_code"))
            );
            console.log("manager", response);
        } catch (error) {
            notification.error({
                description: error || "Failed to Fetch users",
                duration: 1.5,
            });
        }
    };
    const getActiveManagers = async () => {
        try {
            const response = await dispatch(
                gettInActiveManagers(localStorage.getItem("company_code"))
            );
        } catch (error) {
            notification.error({
                description: error || "Failed to Fetch users",
                duration: 1.5,
            });
        }
    };

    useEffect(() => {
        handleInactive();
        getActiveManagers;
    }, []);
    //  const filteredItemsM = useMemo(() => {
    //      return InActiveManagersdata.filter((item) =>
    //          JSON.stringify(item)
    //              .toLowerCase()
    //              .includes(filterText.toLowerCase())
    //      );
    //  }, [InActiveManagersdata, filterText]);
    //  const filteredItems = useMemo(() => {
    //      return inactivedata.filter((item) =>
    //          JSON.stringify(item)
    //              .toLowerCase()
    //              .includes(filterText.toLowerCase())
    //      );
    //  }, [inactivedata, filterText]);
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
            key: "companyEmail",
            defaultSortOrder: "ascend", // Sets the default sorting order
            sorter: (a, b) => {
                const nameA = a.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                const nameB = b.user?.email?.toLowerCase() || ""; // Handle undefined or null values
                return nameA.localeCompare(nameB); // Use localeCompare for string sorting
            },
        },
    ];
    if (loading) return <Loading />;

    // Show error state
    if (error)
        return <Alert message="Error" description={error} type="error" />;

    if (loading) return <Loading />;
    return (
        <>
            <h1>In Active Staff</h1>

            <Flex style={{ justifyContent: "space-between",alignContent:"center",flexWrap:"wrap",marginBottom:"20px" }}>
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
                />
            </Flex>
            <hr />

            {/**/}
            {selectedValue === "Manager" && (
                <>
                    <Table
                        columns={columns} // Pass the columns here
                        dataSource={filteredItemsM} // Pass the employee data here
                        // rowKey={(record) => record.employee.company_code}
                        pagination={true}
                    />
                </>
            )}
            {selectedValue === "Employee" && (
                <Table
                    columns={columns} // Pass the columns here
                    dataSource={filteredItems} // Pass the employee data here
                    // rowKey={(record) => record.employee.company_code}
                    pagination={true}
                />
            )}
        </>
    );
};

export default InactiveEmployee;
