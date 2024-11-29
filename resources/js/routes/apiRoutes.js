const apiRoutes = {
    register: "/register",
    login: "/login",
    logout: "/logout",
    userdetails: "/user/details",
    company: {
        inactive: "/company/in-active-companies",
        onboard: "/company/active-companies",
        approved: (id) => `/approve-user/${id}`,
    },
    employee: {
        showAssignedSchedule: (id) => `/schedule/employee-schedule/${id}`,
        all: (code) => `/all-employees/${code}`,
        invite: "/employee/add-employee",
        inactive: (code) => `/employee/in-active-employee/${code}`,
        checkIn: (id) => `/schedule/check-in/${id}`,
        checkOut: (id) => `/schedule/check-out/${id}`,
        delete: (id) => `/employee/delete/${id}`,
        update: (id) => `/employee/update/${id}`,
        postAvail: "/schedule/add-employee-availability",
        checkedin: "/schedule/checked-in-employees",
        reject: (id) => `/user-reject/${id}`,
        getRejectedUsers:"/rejected-user"
    },
    schedule: {
        create: "/schedule/create-schedule",
        show: (id) => `/company-schedule/${id}`,
        assignSchedule: `/schedule/assign-schedule`,
        delete: (id) => `/schedule/delete/${id}`,
        update: (id) => `/schedule/update/${id}`,
        missedAttended: (id) => `/schedule/missed-attended-schedule/${id}`,
        change: "/schedule/employee-availability-dashboard",
        assignedSchedules: (companyId) =>
            `/schedule/all-assigned-schedule/${companyId}`,
    },
    forgotpassword: {
        email: "/forgot-password",
        verifyCode: "/verify-password-otp",
        resetPassword: "/reset-password",
    },
    paymentIntent: "/create-payment-intent",
};

export default apiRoutes;