import { createAsyncThunk } from "@reduxjs/toolkit";
import apiRoutes from "../../routes/apiRoutes";
import axios from "../../services/axiosService";
import { createSlice } from "@reduxjs/toolkit";

const initialState={
    dataa:[],
    loading:false,
    error:false
}
export const assignedShechule = createAsyncThunk(
    "employee/assignedShechule",
    async (id, { rejectWithValue }) => {
        try {
            console.log("inside showassignedSchedule");
            const response = await axios.get(
                apiRoutes.employee.showAssignedSchedule(id)
            );

            const data = response.data.data;

            // Ensure `data` is an array; otherwise return an empty array
            if (!Array.isArray(data)) {
                console.warn("API returned invalid data format:", data);
                return []; // Return empty array if data is not an array
            }

            console.log("assigned data api", data);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch data"
            );
        }
    }
);

export const assignSchedule = createAsyncThunk('employee/assignSchedule', async (schedulePayload, { rejectWithValue }) => {


    try {
        
        const response = await axios.post(apiRoutes.schedule.assignSchedule, schedulePayload)

        console.log('===============Assign schedule response=====================');
        console.log(response);
        console.log('====================================');

    } catch (error) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to assign schedule"
        );
    }


})


export const checkIn = createAsyncThunk(
    "employee/checkIn",
    async ({ id, time_in }, { rejectWithValue }) => {
        try {
            console.log("Check In employee", id, time_in);

            // POST request with `id` in the URL and `time_in` in the request body
            const response = await axios.post(apiRoutes.employee.checkIn(id), {
                time_in,
            });

            console.log("response data employee checkIn");
            return response.data.data; // Adjusted to access the correct data
        } catch (error) {
            console.error("Error in checkIn:", error);
            return rejectWithValue(
                error.response?.data?.errors || "Failed to check in"
            );
        }
    }
);

export const checkOut = createAsyncThunk(
    "employee/checkout",
    async ({ id, time_out }, { rejectWithValue }) => {
        try {
            console.log("Check Out employee", id, time_out);

            // Assuming apiRoutes.employee.checkOut(id) returns the correct endpoint
            const response = await axios.post(apiRoutes.employee.checkOut(id), {
                time_out, // Send time_out in the body of the request
            });

            console.log("response data employee checkOut", response.data);
            return response.data.data; // Ensure this is the correct structure based on your API response
        } catch (error) {
            console.error("Error during checkout:", error);
            return rejectWithValue(
                error.response?.data?.errors || "Failed to check out"
            );
        }
    }
);



const assigendScheduleSlice = createSlice({
    name: "schedule",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(assignedShechule.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(assignedShechule.fulfilled, (state, action) => {
                state.dataa = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(assignedShechule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default assigendScheduleSlice.reducer;