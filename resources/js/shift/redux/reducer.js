import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";

const initialState = {
    error: false,
    loading: false,
    scheduledata: [], // Initialize as an empty array
    changeRequestData: [],
    assignedSchedules: []
};

export const getAssignedSchedules = createAsyncThunk('employee/getAssignedSchedules', async (companyId, { rejectWithValue }) => {
    try {
       const res = await axios.get(apiRoutes.schedule.assignedSchedules(companyId))
       
    //    console.log("res of assignedSchedules:", res);
       return res.data.data
    } catch (error) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch data"
        );
    }
})

export const createSchedule = createAsyncThunk(
    "schedule/create",
    async (data, { rejectWithValue }) => {
        try {
            // console.log("inside inactive api");
            const response = await axios.post(apiRoutes.schedule.create,data);
            // console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            // console.log("redux error: " + error);
            return rejectWithValue(error.response || "Failed to fetch data");
        }
    }
);
// Async thunk to fetch schedule data
export const showSchedule = createAsyncThunk(
    "schedule/show",
    async (id, { rejectWithValue }) => {  // Accept `id` as parameter
        try {
            console.log("inside showSchedule");
            const response = await axios.get(apiRoutes.schedule.show(id)); // Pass `id` directly
            // Return the data payload if successful
            return response.data.data;
        } catch (error) {
            // Handle error and use rejectWithValue for Redux error state
            return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
        }
    }
);
export const deleteSchedule = createAsyncThunk(
    "schedule/delete",
    async (id, { rejectWithValue }) => {
        try {
            console.log("inside inactive api");
            const response = await axios.post(apiRoutes.schedule.delete(id));
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(error.response || "Failed to fetch data");
        }
    }
);

export const updateSchedule = createAsyncThunk(
    "schedule/update",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            console.log("inside inactive api");
            const response = await axios.post(
                apiRoutes.schedule.update(id),
                payload
            );
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(error.response || "Failed to fetch data");
        }
    }
);
export const getChangeRequest = createAsyncThunk(
    "schedule/getChangeRequest",
    async (code, { rejectWithValue }) => {
        try {
            console.log("inside chnage request api");
            const response = await axios.get(apiRoutes.schedule.change(code));
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(error.response || "Failed to fetch data");
        }
    })

// Create schedule slice with reducers
// Create schedule slice with reducers
const scheduleSlice = createSlice({
    name: "schedule",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(showSchedule.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(showSchedule.fulfilled, (state, action) => {
                state.scheduledata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(showSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(getChangeRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(getChangeRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.changeRequestData = action.payload; // Store the fetched data
            })
            .addCase(getChangeRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Handle error if needed
            })
            .addCase(getAssignedSchedules.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(getAssignedSchedules.fulfilled, (state, action) => {
                state.assignedSchedules = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(getAssignedSchedules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});


export default scheduleSlice.reducer;