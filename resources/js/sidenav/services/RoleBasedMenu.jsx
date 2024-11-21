import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IoMdNotificationsOutline, IoIosTimer } from "react-icons/io";
import { FiUsers } from "react-icons/fi";
import { IoTimeOutline } from "react-icons/io5";
import { userData } from "../../dashboard/redux/reducer";
import { RiHomeOfficeFill } from "react-icons/ri";
import { MdWork, MdCoPresent, MdTimer } from "react-icons/md";
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
        getItem(
            <Link to="/dashboard">Dashboard</Link>,
            "/dashboard", // Key should match the path for proper selection
            <MdWork />
        ),
    ];

    // Define menu items based on the user's role
    if (userRole === "super_admin") {
        items.push(
            getItem("New Signups", "company", <RiHomeOfficeFill />, [
                getItem(
                    <Link to="/onboard">Active</Link>,
                    "/onboard", // Key matching the URL path
                    <MdWork />
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
            getItem("Shift", "shift", <IoIosTimer />, [
                getItem(
                    <Link to="/shift">Shifts</Link>,
                    "/shift", // Key matching the URL path
                    <IoTimeOutline />
                ),
                getItem(
                    <Link to="/assign-shift">Assign Shift</Link>,
                    "/assign-shift", // Key matching the URL path
                    <MdTimer />
                ),
            ]),
            getItem(
                <Link to="/new-registration">New Registrations</Link>,
                "/new-registration", // Key matching the URL path
                <IoMdNotificationsOutline />
            )
        );
    } else if (userRole === "employee") {
        items.push(
            getItem(
                <Link to="/attendance">Attendance</Link>,
                "/attendance", // Key matching the URL path
                <MdCoPresent />
            )
        );
    }

    return items;
};

export default RoleBasedMenu;
