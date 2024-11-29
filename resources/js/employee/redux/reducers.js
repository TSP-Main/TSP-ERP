import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../services/axiosService";
import apiRoutes from "../../routes/apiRoutes";
import { CodeFilled } from "@ant-design/icons";

const initialState = {
    error: false,
    loading: false,
    employeedata: [],
    rejecteddata: null,
    InvitedUsers: null,
    inactivedata:null,
    getCancelInvitedUsers:null,
};
export const deleteEmployee = createAsyncThunk(
    "employee/delete",
    async (id, { rejectWithValue }) => {
        try {
            console.log("inside inactive api");
            const response = await axios.post(apiRoutes.employee.delete(id));
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(error.response || "Failed to fetch data");
        }
    }
);


export const updateEmployee = createAsyncThunk(
    "employee/update",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            console.log("inside inactive api");
            const response = await axios.post(
                apiRoutes.employee.update(id),
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
export const allEmployee = createAsyncThunk(
    "user/employee",
    async ({ code, role }, { rejectWithValue }) => {
        try {
            console.log("Users", code, role);
            console.log("Employeeseses", { role });
            const response = await axios.get(apiRoutes.employee.active(code), {
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

export const inActiveEmployee = createAsyncThunk(
    "user/inacticeemployee",
    async (code, { rejectWithValue }) => {
        try {
            
            const response = await axios.get(apiRoutes.employee.inactive(code));
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
export const checkedinEmployee = createAsyncThunk(
    "user/employee",
    async (payload, { rejectWithValue }) => {
        try {
            // console.log("Users", code, role);
            // console.log("Employeeseses", { role });
            const response = await axios.get(
                apiRoutes.employee.checkedin,
                payload
            );
            console.log("ched in employee", response.data.data);
            return response.data.data;
        } catch (error) {
            console.log("redux error: " + error);
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
);
export const getInvitedUsers = createAsyncThunk(
    "user/getInvitedUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.employee.getInvitedUsers
            );
            console.log("invited data", response.data.data.data);
            return response.data.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
);

export const cancelInvite = createAsyncThunk(
    "user/cancelInvite",
    async (id, { rejectWithValue }) => {
        try {
            console.log("inside canceled api");
            const response=await axios.post(apiRoutes.employee.cancelInvite(id));
            console.log("response: " + response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.errors || "Failed to Cancel Invite"
            );
        }
    }
);

export const getRejectedUser = createAsyncThunk(
    "user/getreject",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                apiRoutes.employee.getRejectedUsers
            );
            console.log("response data reject", response.data.data.data);
            return response.data.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.errors || "Failed to fetch data"
            );
        }
    }
);
export const approveUserAction = createAsyncThunk(
    "user/approve",
    async (id, { rejectWithValue }) => {
        try {
            console.log("approving ....");
            const response = await axios.get(apiRoutes.company.approved(id));
            console.log("approved user", response.data.data);
            return response.data.data; // Return data to update state if needed
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to approve user"
            );
        }
    }
);

export const cancelInvitedEmloyee=createAsyncThunk(
    "cancelInvitedEmloyee",
    async(_,{rejectWithValue})=>{
        try{
            const response = await axios.get(
                apiRoutes.employee.getCancelInvited
            );
            return response.data.data.data;
        }catch(error){
            return rejectWithValue(
                error.response?.errors || "Failed to Cancel Invite"
            );
        }
    }
)

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
                state.error = action.error;
            })
            .addCase(getRejectedUser.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(getRejectedUser.fulfilled, (state, action) => {
                state.rejecteddata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(getRejectedUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(getInvitedUsers.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(getInvitedUsers.fulfilled, (state, action) => {
                state.InvitedUsers = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(getInvitedUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(inActiveEmployee.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(inActiveEmployee.fulfilled, (state, action) => {
                state.inactivedata = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(inActiveEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(cancelInvitedEmloyee.pending, (state, action) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(cancelInvitedEmloyee.fulfilled, (state, action) => {
                state.getCancelInvitedUsers = action.payload;
                state.loading = false;
                state.error = false;
            })
            .addCase(cancelInvitedEmloyee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            });
    },
});

export default employeeSlice.reducer;
