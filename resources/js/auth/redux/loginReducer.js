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

export const login = createAsyncThunk(
    "user/login",
    async (authdata, { rejectWithValue }) => {
        try {
            const response = await axios.post(apiRoutes.login, authdata);
            console.log(response);
            if (response.data.status === 200) {
                notification.success({
                    message: "Success",
                    description: response.data.message,
                });
                localStorage.setItem(
                    "access_token",
                    response.data.data.access_token
                );
            }
            return data;
        } catch (error) {
            console.log("erroe redux", error);
          return  rejectWithValue(error.response?.data?.message || "Invalid Credentials");
        }
    }
);
export const SignUp = createAsyncThunk(
    "user/signup",
    async (authdata, { rejectWithValue }) => {
        try {
            const response = await axios.post(apiRoutes.register, authdata);
            if (response.data.status === 200) {
                notification.success({
                    message: "Success Please Wait for the approval process",
                    description: response.data.message,
                });
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
                state.error = true;
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
