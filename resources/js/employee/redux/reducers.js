import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";
import { CodeFilled } from "@ant-design/icons";

const initialState = {
    error: false,
    loading: false,
    employeedata: null,
};

export const allEmployee = createAsyncThunk(
    "user/employee",
    async ({ code, role }, { rejectWithValue }) => {
        try {
            console.log("Users", code, role);
            console.log("Employeeseses",{role})
            const response = await axios.get(apiRoutes.employee.all(code), {
                params: {
                    role: role,
                },
            });
            console.log("employee", response.data.data.data);
            return response.data.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
);

export const sendInvite = createAsyncThunk(
    "user/invite",
    async (data, { rejectWithValue }) => {
        try {
            console.log("inside inactive api");
            const response = await axios.post(apiRoutes.employee.invite, data);
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(error.response || "Failed to fetch data");
        }
    }
);
// export const approveUserAction = createAsyncThunk(
//     "user/approve",
//     async (id, { rejectWithValue }) => {
//         try {
//             console.log("approving ....");
//             const response = await axios.get(apiRoutes.company.approved(id));
//             return response.data; // Return data to update state if needed
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data?.message || "Failed to approve user"
//             );
//         }
//     }
// );

const employeeSlice = createSlice({
    name: "company",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(allEmployee.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(allEmployee.fulfilled, (state, action) => {
                state.employeedata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(allEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
            });
    },
});

export default employeeSlice.reducer;
