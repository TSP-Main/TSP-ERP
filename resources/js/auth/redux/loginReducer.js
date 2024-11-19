import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";
import { notification } from "antd";
const initialState = {
    error: false,
    loading: false,
    authdata: null,
    registerdata: null,
};


// console.log("stripe promise",stripePromise)
export const getPrice=createAsyncThunk(
    'user/getPrice',
    async(data,{rejectWithValue})=>{
        try{
          const response=await axios.post(apiRoutes.paymentIntent,data);
        //   console.log(response.data)
          return response.data;
        }catch(error){
             return rejectWithValue(
                 error.response?.data?.errors || "Error"
             );

        }
    }
)
export const login = createAsyncThunk(
    "user/login",
    async (authdata, { rejectWithValue }) => {
        try {
            const response = await axios.post(apiRoutes.login, authdata);
            // console.log(response);
            if (response.status === 200) {
               
                localStorage.setItem(
                    "access_token",
                    response.data.data.access_token
                );


            }
            return response;
        } catch (error) {
            // console.log("login redux", error);
            console.log("hihi", error.response?.data?.errors);

          return rejectWithValue(
              error.response?.data?.errors || "Invalid Credentials"
          );
        }
    }
);
export const SignUp = createAsyncThunk(
    "user/signup",
    async (authdata, { rejectWithValue }) => {
        try {
            const response = await axios.post(apiRoutes.register, authdata);
            if (response.data.status === 200) {
                localStorage.setItem(
                    "access_token",
                    response.data.data.access_token
                );
            }
            return response.data;
        } catch (error) {
            console.log("Registration redux error", error);
            return rejectWithValue(
                error.response?.data?.message || "Registration failed"
            );
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.authdata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action?.error?.message;
            })
            .addCase(SignUp.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(SignUp.fulfilled, (state, action) => {
                state.registerdata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(SignUp.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
            });
            
    },
});

export default authSlice.reducer;
