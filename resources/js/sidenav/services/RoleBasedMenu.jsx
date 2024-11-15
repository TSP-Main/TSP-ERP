// RoleBasedMenu.jsx
import React,{useEffect} from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector to access Redux store
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiUsers } from "react-icons/fi";
import { MdAirplanemodeActive } from "react-icons/md";
import { CiTimer } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { userData } from "../../dashboard/redux/reducer";
function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const RoleBasedMenu = () => {
    // Get the role from the Redux store
    const {userdata}=useSelector((state)=>state.user)
    const dispatch=useDispatch();
    useEffect(()=>{
        dispatch(userData());
    },[])
     console.log("user data", userdata)
    const userRole = userdata?.data?.roles?.[0]?.name;
    console.log("user role ",userRole)
    let items = [
        getItem(
            <Link to="/profile">Profile</Link>,
            "6",
            <MdAirplanemodeActive />
        ),
    ];

    // Define menu items based on the user's role
    if (userRole === "super_admin") {
        items.push(
            getItem("Company", "2", <FaRegBuilding />, [
                getItem(
                    <Link to="/onboard">Onboard</Link>,
                    "3",
                    <MdAirplanemodeActive />
                ),
                getItem(
                    <Link to="/inactive">New Request</Link>,
                    "4",
                    <IoMdNotificationsOutline />
                ),
            ])
        );
    } else if (userRole === "company" || userRole === "manager") {
        items.push(
            getItem(<Link to="/employee">Employee</Link>, "5", <FiUsers />),
            // getItem(<Link to="/shift">Shift</Link>, "7", <CiTimer />)
            getItem("Shift", "7", <FaRegBuilding />, [
                getItem(
                    <Link to="/shift">Shifts</Link>,
                    "8",
                    <MdAirplanemodeActive />
                ),
                getItem(
                    <Link to="/assign-shift">Assign Shift</Link>,
                    "9",
                    <IoMdNotificationsOutline />
                ),
            ]),
            getItem(<Link to="/new-registration">New Registrations</Link>, "10", <FiUsers />),
          
        );
    }else if(userRole == "employee"){
        items.push(
             getItem(<Link to="/attendance">Attendance</Link>, "11", <FiUsers />))
    }


    return items;
};

export default RoleBasedMenu;
