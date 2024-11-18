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
        all: (code) => `/all-employees/${code}`,
        invite: "/employee/add-employee",
        inactive: (code) => `/employee/in-active-employee/${code}`,
    },
    schedule: {
        create: "/schedule/create-schedule",
        show: (id) => `/schedule/${id}`,
    },
    paymentIntent: "/create-payment-intent",
};

export default apiRoutes;