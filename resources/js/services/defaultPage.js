// services/defaultPage.js
export const getDefaultPage = (userdata) => {
    const userRole = userdata?.data?.roles?.[0]?.name;
    switch (userRole) {
        case "super_admin":
            return "/onboard";
        case "company":
        case "manager":
            return "/employee";
        case "employee":
            return "/attendance";
        default:
            return "/login"; // Redirect to login if no role
    }
};
