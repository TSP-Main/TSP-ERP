import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";

const initialState = {
    error: false,
    loading: false,
    inactivedata: null,
    onboarddata: null,
};

export const inactiveUsersData = createAsyncThunk(
    "user/inactiveUsersData",
    async (rejectWithValue ) => {
        try {
            console.log("inside inactive api")
            const response = await axios.get(apiRoutes.company.inactive);
            console.log("inactive",response.data.data);
            return response.data.data.data;
        } catch (error) {
            console.log("redux error: " + error)
            return rejectWithValue(
                error.response?.errors|| "Failed to fetch data"
            );
        }
    }
);
export const activeUsersData = createAsyncThunk(
    "user/activeUsersData",
    async (rejectWithValue) => {
        try {
            
            console.log("inside active api")
            const response = await axios.get(apiRoutes.company.onboard);
            console.log("onbbbbb",response.data.data);
            return response.data.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch data"
            );
        }
    }
);
export const approveUserAction = createAsyncThunk(
    "user/approve",
    async (id, { rejectWithValue }) => {
        try {
            console.log("approving ....")
            const response = await axios.get(apiRoutes.company.approved(id));
            console.log("approved user",response.data.data);
            return response.data.data; // Return data to update state if needed
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to approve user"
            );
        }
    }
);

const companySlice = createSlice({
    name: "company",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(activeUsersData.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(activeUsersData.fulfilled, (state, action) => {
                state.onboarddata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(activeUsersData.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
            })

            .addCase(inactiveUsersData.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(inactiveUsersData.fulfilled, (state, action) => {
                state.inactivedata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(inactiveUsersData.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
            });
    },
});

export default companySlice.reducer;
