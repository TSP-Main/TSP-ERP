const apiRoutes = {
    register: "/register",
    login: "/login",
    logout: "/logout",
    company: {
        inactive: "/company/in-active-companies",
        onboard: "/company/active-companies",
        approved: (id) => `/approve-user/${id}`,
    },
    employee: {
        all:(code)=> `/all-employees/${code}`,
    },
};

export default apiRoutes;