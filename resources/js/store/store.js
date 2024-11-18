import { configureStore } from "@reduxjs/toolkit";
import companyReducer, { inactiveUsersData } from "../company/redux/reducer";
import authReducer from '../auth/redux/loginReducer'
import userReducer from '../dashboard/redux/reducer'
import employeeReducer from '../employee/redux/reducers'
import inactiveESlice from '../new_registration/redux/reducer'
import scheduleReducer from '../shift/redux/reducer'
const store = configureStore({
    reducer: {
        company: companyReducer,
        auth: authReducer,
        user: userReducer,
        employee:employeeReducer,
        schedule: scheduleReducer,
        inactive: inactiveESlice
    },
});

export default store;
