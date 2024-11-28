import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IoMdNotificationsOutline, IoIosTimer } from "react-icons/io";
import { FiUsers } from "react-icons/fi";
import { IoTimeOutline } from "react-icons/io5";
import { userData } from "../../dashboard/redux/reducer";
import { RiHomeOfficeFill } from "react-icons/ri";
import {
    MdWork,
    MdCoPresent,
    MdTimer,
    MdCancel,
    MdOutlineCoPresent,
} from "react-icons/md";
import { FcInvite } from "react-icons/fc";
import { GrDocumentMissing } from "react-icons/gr";
import { TbReport } from "react-icons/tb";
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
                <Link to="/rota">ROTA</Link>,
                "/rota", // Key matching the URL path
                <FiUsers />
            ),
            getItem("Employee", "employee", <FiUsers />, [
                getItem(
                    <Link to="/employee">Active Employees</Link>,
                    "/employee", // Key matching the URL path
                    <IoTimeOutline />
                ),
                getItem(
                    <Link to="/new-registration">New Sign Ups</Link>,
                    "/new-registration", // Key matching the URL path
                    <IoMdNotificationsOutline />
                ),
                getItem(
                    <Link to="/invites">Invited Employee</Link>,
                    "/invites", // Key matching the URL path
                    <FcInvite />
                ),
                getItem(
                    <Link to="/rejected-employee">Rejected Employee</Link>,
                    "/rejected-employee", // Key matching the URL path
                    <MdCancel />
                ),
                getItem(
                    <Link to="/invite-cancel">Invite Canceled Employee</Link>,
                    "/invite-cancel", // Key matching the URL path
                    <MdCancel />
                ),
            ]),
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
                getItem(
                    <Link to="/change-shift">Change Shift</Link>,
                    "/change-shift", // Key matching the URL path
                    <MdTimer />
                ),
            ])
        );
    } else if (userRole === "employee") {
        items.push(
            getItem(
                <Link to="/attendance">Attendance</Link>,
                "/attendance", // Key matching the URL path
                <MdCoPresent />
            ),
            getItem("Report", "reports", <TbReport />, [
                getItem(
                    <Link to="/attended">Attended</Link>,
                    "/attended", // Key matching the URL path
                    <MdOutlineCoPresent />
                ),

                getItem(
                    <Link to="/missed">Missed</Link>,
                    "/missed", // Key matching the URL path
                    <GrDocumentMissing />
                ),
            ])
        );
    }

    return items;
};

export default RoleBasedMenu;
