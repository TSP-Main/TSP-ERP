import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";

const initialState = {
    error: false,
    loading: false,
    userdata:null
};

export const userData = createAsyncThunk(
    "userdetails",
    async (rejectWithValue) => {
        try {
            console.log("usersrsrsrs")
            const response = await axios.get(apiRoutes.userdetails);
            console.log("useeerrr", response.data.data.roles[0].name);
            const role = response.data.data.roles[0].name;
            localStorage.setItem("role", response.data.data.roles[0].name)
             localStorage.setItem("name", response.data.data.name);
            
           if (
               role === "company" ||
               role === "manager"
           ) {
               localStorage.setItem(
                   "company_code",
                   response.data.data.company?.code
               );
               localStorage.setItem(
                   "company_id",
                   response?.data?.data?.company?.id
               );
           } else if (role === "employee") {
               localStorage.setItem(
                   "employee_id",
                   response?.data?.data?.employee?.id
               );
           }

               
           
            return response.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
);


const userSlice = createSlice({
    name: "user",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(userData.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(userData.fulfilled, (state, action) => {
                state.userdata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(userData.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
            })

    },
});

export default userSlice.reducer;
