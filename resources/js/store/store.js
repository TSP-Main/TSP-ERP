import { configureStore } from "@reduxjs/toolkit";
import companyReducer, { inactiveUsersData } from "../company/redux/reducer";
import authReducer from '../auth/redux/loginReducer'
import userReducer from '../dashboard/redux/reducer'
import managerSlice from "../manager/redux/reducer";
import employeeReducer from '../employee/redux/reducers'
import inactiveESlice from '../new_registration/redux/reducer'
import scheduleReducer from '../shift/redux/reducer'
import  assignedShechuleSlice  from "../attendance/redux/reducer";
import scheduleEmployeeSlice from '../reports/attended/reducer';

const store = configureStore({
    reducer: {
        company: companyReducer,
        auth: authReducer,
        user: userReducer,
        employee: employeeReducer,
        schedule: scheduleReducer,
        inactive: inactiveESlice,
        assignedShechule: assignedShechuleSlice,
        scheduleEmployee: scheduleEmployeeSlice,
        manager:managerSlice,
    },
});

export default store;
