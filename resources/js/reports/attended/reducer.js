import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";
import { CodeFilled } from "@ant-design/icons";

const initialState = {
    error: false,
    loading: false,
    employeedata: [],
    missed:[]
};
export const missedSchedule = createAsyncThunk(
    "employee/schedule/missed",
    async (id, { rejectWithValue }) => {
        try {
           
            const response = await axios.get(apiRoutes.schedule.missedAttended(id));
            console.log("missed schedule", response.data.data.missed_schedules);
            return response.data.missed_schedules;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(error.response || "Failed to fetch data");
        }
    }
);

export const attendedSchedule = createAsyncThunk(
    "employee/schedule/attended",
    async ({id,payload}, { rejectWithValue }) => {
        try {
             console.log("id", id, payload);
            const response = await axios.get(
                apiRoutes.schedule.missedAttended(id),
                payload
            );
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.log("redux error: " + error.response.errors);

            return rejectWithValue(error.response || "Failed to fetch data");
        }
    }
);

const scheduleEmployeeSlice = createSlice({
    name: "schedule/employee",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(attendedSchedule.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(attendedSchedule.fulfilled, (state, action) => {
                state.employeedata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(attendedSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(missedSchedule.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(missedSchedule.fulfilled, (state, action) => {
                state.missed = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(missedSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            });
    },
});

export default scheduleEmployeeSlice.reducer;
