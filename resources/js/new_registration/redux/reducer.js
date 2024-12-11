import { createAsyncThunk } from "@reduxjs/toolkit"
import apiRoutes from "../../routes/apiRoutes";
import { createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
const initialState={
   data:null,
   loading:false,
   error:false,
   getrejectuser:[]
}
export const userReject=createAsyncThunk("user/reject",
    async(id,{rejectWithValue})=>{
        try{
            const response=await axios.post(apiRoutes.employee.reject(id));
            console.log("response data",response.data.data);
            return response.data.data;
        }catch(error){
            return rejectWithValue(
                error.response?.errors || "Failed to Reject this user"
            );
        }
    }
)
export const total=createAsyncThunk(
    "total",
    async(code,{rejectWithValue})=>{
        try{
            const response=await axios.get(apiRoutes.employee.total(code));
            return response.data.data;
        }catch(error){
             console.log("error");
             return rejectWithValue(
                 error.response?.errors || "Failed to fetch data"
             );

        }
    }
)
export const inactiveEmployee=createAsyncThunk(
    "employee/inactive",
    async(code,{rejectWithValue})=>{
        try{
            console.log(
                "inactive employee API",
                apiRoutes.employee.inactive(code)
            );
            
            const response=await axios.get(apiRoutes.employee.inactive(code));
            console.log("response data employee inactive",response.data.data.data);
            return response.data.data.data;
        }catch(error){
            console.log('error')
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
)


// Create schedule slice with reducers
const InActiveEmployeeSlice = createSlice({
    name: "inactive",
    initialState: {
        data: null,
        loading: false,
        error: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(inactiveEmployee.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(inactiveEmployee.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(inactiveEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default InActiveEmployeeSlice.reducer;