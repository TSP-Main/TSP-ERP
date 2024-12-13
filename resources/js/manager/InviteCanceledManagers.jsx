import React, { useEffect } from "react";
import { Table,  notification} from "antd";

import { useDispatch, useSelector } from "react-redux";
import { gettCancelledInvitedManagers } from "./redux/reducer";




const InvitedCanceledManagers = () => {
    const dispatch = useDispatch();
    const { cancelInviteddata } = useSelector((state) => state.manager);

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
            <h4 style={{ textAlign: "center" }}>Managers</h4>
           
        </>
    );
};

export default InvitedCanceledManagers;
