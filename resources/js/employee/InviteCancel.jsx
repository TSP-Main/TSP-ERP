import React, { useEffect,useMemo,useState } from "react";
import { Table, Spin,Alert,Flex } from "antd";
import { MdCancelPresentation } from "react-icons/md";
import { useDispatch,useSelector } from "react-redux";
import { cancelInvitedEmloyee } from "./redux/reducers";
import Loading from "../Loading";
import { gettCancelledInvitedManagers } from "../manager/redux/reducer";
import FilterComponent from "../components/FilterComponent";
import Selection from "../components/Selection";

const InvitCancel = () => {
    const dispatch=useDispatch();
    const { cancelInviteddata } = useSelector((state) => state.manager);
      const { error, loading, getCancelInvitedUsers } = useSelector(
          (state) => state.employee
      );

    useEffect(() => {
        fetchInvitedCanceledManagers();
    }, []);

    const fetchInvitedCanceledManagers = async () => {
        try {
            await dispatch(
                gettCancelledInvitedManagers(
                    localStorage.getItem("company_code")
                )
            );
        } catch (error) {
            notification.error({
                message: "Error",
                description: error || "Failed to fetch invited managers.",
                duration: 2,
            });
        }
    };


  
    console.log("Invited sbbwhs", getCancelInvitedUsers);
    const fetchCancelInvitedEmployees =async () =>{
        try{
            await dispatch(cancelInvitedEmloyee(localStorage.getItem("company_code")));
        }catch(error){
            notification.error({
                description: error || "Failed to get users",
                duration: 1.5,
            })
        }
    }
    useEffect(()=>{
        fetchCancelInvitedEmployees();
    },[])
     const [selectedValue, setSelectedValue] = useState("Employee");
         const [filterText, setFilterText] = useState("");
        const handleSelectedValue = (value) => {
            setSelectedValue(value);
            console.log("Selected Value:", value); // You can perform other actions with the selected value
        }
        // Fetch employees whenever the selected role changes
      
    
          // Handle filter changes
          const handleFilterChange = (value) => {
              setFilterText(value);
          };
    
          // Clear the filter text
          const handleClearFilter = () => {
              setFilterText("");
          };
          const filteredItemsM = useMemo(() => {
            if(cancelInviteddata==null) return []
              return cancelInviteddata.filter((item) =>
                  JSON.stringify(item)
                      .toLowerCase()
                      .includes(filterText.toLowerCase())
              );
          }, [cancelInviteddata, filterText]);
          const filteredItems = useMemo(() => {
             if (getCancelInvitedUsers == null) return [];
              return getCancelInvitedUsers.filter((item) =>
                  JSON.stringify(item)
                      .toLowerCase()
                      .includes(filterText.toLowerCase())
              );
          }, [getCancelInvitedUsers, filterText]);
       if (loading) return <Loading/>;

       // Show error state
       if (error)
           return <Alert message="Error" description={error} type="error" />;

    
    return (
        <>
            <h1>Invite Cancel Employee</h1>
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
            {selectedValue === "Manager" && (
                <Table
                    dataSource={filteredItemsM}
                    columns={columns}
                    pagination={true}
                />
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
export const columns = [
    {
        title: "Name",
        dataIndex: ["user", "name"],
        key: "companyName",
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
    {
        title: "Manager",
        dataIndex: ["manager", "user", "name"],
        key: "manager",
    },

    // {
    //     title: "Actions",
    //     key: "actions",
    //     // render: (text, record) => (
    //     //     <div style={{ display: "flex", gap: "8px" }}>
    //     //         <Button
    //     //             style={{
    //     //                 border: "none",
    //     //                 color: "red",
    //     //             }}
    //     //             // onClick={() => onView(record.id)}
    //     //             icon={<MdCancelPresentation />}
    //     //         />
    //     //         {/* <Button icon={<MdDelete />} /> */}
    //     //     </div>
    //     // ),
    // },
];

export default InvitCancel;
