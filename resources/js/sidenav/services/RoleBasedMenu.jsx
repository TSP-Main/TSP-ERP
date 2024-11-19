import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiUsers } from "react-icons/fi";
import { MdAirplanemodeActive } from "react-icons/md";
import { CiTimer } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { userData } from "../../dashboard/redux/reducer";

// Helper function to create menu items
function getItem(label, key, icon, children) {
    return {
        key, // Key is the unique identifier for each menu item
        icon,
        children,
        label,
    };
}

const RoleBasedMenu = () => {
    const { userdata } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(userData());
    }, [dispatch]);

    // console.log("user data", userdata);
    const userRole = userdata?.data?.roles?.[0]?.name;
    // console.log("user role ", userRole);

    // Default menu items for all roles
    let items = [
        // getItem(
        //     <Link to="/profile">Profile</Link>,
        //     "/profile", // Key should match the path for proper selection
        //     <MdAirplanemodeActive />
        // ),
    ];

    // Define menu items based on the user's role
    if (userRole === "super_admin") {
        items.push(
            getItem("Company", "company", <FaRegBuilding />, [
                getItem(
                    <Link to="/onboard">Onboard</Link>,
                    "/onboard", // Key matching the URL path
                    <MdAirplanemodeActive />
                ),
                getItem(
                    <Link to="/inactive">New Request</Link>,
                    "/inactive", // Key matching the URL path
                    <IoMdNotificationsOutline />
                ),
            ])
        );
    } else if (userRole === "company" || userRole === "manager") {
        items.push(
            getItem(
                <Link to="/employee">Employee</Link>,
                "/employee", // Key matching the URL path
                <FiUsers />
            ),
            getItem("Shift", "shift", <FaRegBuilding />, [
                getItem(
                    <Link to="/shift">Shifts</Link>,
                    "/shift", // Key matching the URL path
                    <MdAirplanemodeActive />
                ),
                getItem(
                    <Link to="/assign-shift">Assign Shift</Link>,
                    "/assign-shift", // Key matching the URL path
                    <IoMdNotificationsOutline />
                ),
            ]),
            getItem(
                <Link to="/new-registration">New Registrations</Link>,
                "/new-registration", // Key matching the URL path
                <FiUsers />
            )
        );
    } else if (userRole === "employee") {
        items.push(
            getItem(
                <Link to="/attendance">Attendance</Link>,
                "/attendance", // Key matching the URL path
                <FiUsers />
            )
        );
    }

    return items;
};

export default RoleBasedMenu;
