import React, { useEffect,useState,useMemo} from "react";
import { Table, Button,Spin,Alert,Flex } from "antd";
import { TiTick } from "react-icons/ti";
import { useDispatch,useSelector } from "react-redux";
import { getRejectedUser } from "./redux/reducers";
import Loading from "../Loading";
import FilterComponent from "../components/FilterComponent";
import Selection from "../components/Selection";

const RejectedEmployee = () => {
     const { error, loading, rejecteddata } = useSelector(
         (state) => state.employee
     );
     console.log("Employee data", rejecteddata);
    const dispatch=useDispatch();
        const getRejectedEmployees = () => {
            dispatch(getRejectedUser(localStorage.getItem('company_code')));
        }
    useEffect(()=>{
        getRejectedEmployees();
    },[])
   
         const [filterText, setFilterText] = useState("");
          const handleFilterChange = (value) => {
              setFilterText(value);
          };
    
          // Clear the filter text
          const handleClearFilter = () => {
              setFilterText("");
          };
          const filteredItemsM = useMemo(() => {
            if(rejecteddata==null) return []
              return rejecteddata.filter((item) =>
                  JSON.stringify(item)
                      .toLowerCase()
                      .includes(filterText.toLowerCase())
              );
          }, [rejecteddata, filterText]);
    // const data = [
    //     {
    //         name: "Test",
    //         email: "test",
    //         employee: { company_code: "12345" },
    //     },
    // ];
       if (loading) return <Loading/>;

       // Show error state
       if (error)
           return <Alert message="Error" description={error} type="error" />;

    return (
        <>
            <h1>Rejected Employees</h1>
            {/* <Flex style={{ justifyContent: "space-between" }}> */}
                {/* <Selection onSelect={handleSelectedValue} /> */}
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
            {/* </Flex> */}
            <hr />
            <Table
                columns={columns} // Pass the columns here
                dataSource={filteredItemsM} // Pass the employee data here
                // rowKey={(record) => record.employee.company_code}
                pagination={false}
            />
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
    // {
    //     title: "Company Code",
    //     dataIndex: ["employee", "company_code"],
    //     key: "companyCode",
    // },
    // {
    //     title: "Actions",
    //     key: "actions",
    //     render: (text, record) => (
    //         <div style={{ display: "flex", gap: "8px" }}>
    //             <Button

    //                 style={{
    //                     border: "none",
    //                     background: "green",
    //                     color: "white",
    //                 }}
    //                 // onClick={() => onView(record.id)}
    //                 icon={<TiTick />}
    //             />
    //             {/* <Button icon={<MdDelete />} /> */}
    //         </div>
    //     ),
    // },
];

export default RejectedEmployee;
