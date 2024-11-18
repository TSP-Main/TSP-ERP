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
    },
    schedule: {
        create: "/schedule/create-schedule",
        show: (id) => `/schedule/${id}`,
    },
    forgotpassword: {
        email: "/forgot-password",
        verifyCode: "/verify-password-otp",
    },
    paymentIntent: "/create-payment-intent",
};

export default apiRoutes;