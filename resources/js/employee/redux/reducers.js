import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";
import { CodeFilled } from "@ant-design/icons";

const initialState = {
    error: false,
    loading: false,
    employeedata:null
};

export const allEmployee = createAsyncThunk(
    "user/employee",
    async (code,{rejectWithValue}) => {
        try {
            console.log("inside inactive api");
            const response = await axios.get(apiRoutes.employee.all(code));
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
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
            })

    },
});

export default employeeSlice.reducer;
