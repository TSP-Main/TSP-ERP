import { configureStore } from "@reduxjs/toolkit";
import companyReducer, { inactiveUsersData } from "../company/redux/reducer";
import authReducer from '../auth/redux/loginReducer'
const store = configureStore({
    reducer: {
        company: companyReducer,
        auth: authReducer
    },
});

export default store;
